#!/usr/bin/env bash

scriptDir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
projectDir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && cd ../.. && pwd )"
projectName=$( cat ${projectDir}/package.json | jq -r '.name' )

cd ${scriptDir}

function sourcePrivateEnv() {
   local privateEnv=$( ls -a \
   | grep -E "private-.*\.sh" \
   | grep -v "private-env.default.sh")

   echo "privateEnv:"${privateEnv}

  declare -a arr=(${privateEnv})

  for word in ${arr[@]}
  do
      source ${word}
  done

  echo "sourcePrivateEnv: "${nowAppend}
}

# 先载入私有环境
sourcePrivateEnv

# 载入依赖
source constants.sh
source util.sh
source build.sh

function resetDir() {
  cd ${projectDir}
}


function getDeployments() {
  echo $(curl --request GET \
   --url https://api.zeit.co/now/deployments \
   --header "authorization: Bearer ${nowToken}" \
   | jq "[.deployments[] | select(.name | contains(\"${projectName}\"))]  | sort_by(.created) | reverse")
}

function deleteOldVersion() {
  local deployments=$(getDeployments)
  local maintainUid=$( echo ${deployments} | jq '[.[] | select(.state == "READY")] | first | .uid' )

  local deleteUidList=$( echo $( echo ${deployments} | jq ".[] | select(.uid != ${maintainUid}) | .uid" ) )

  echo "deleteUidList: "${deleteUidList}

  declare -a arr=(${deleteUidList})

  for word in ${arr[@]}
  do
      echo ${word} | gsed -E "s/\"(.*)\"/\1/gi" | xargs -I {} curl --request DELETE --url https://api.zeit.co/now/deployments/{} --header "authorization: Bearer ${nowToken}"
  done
}

function deploy() {
  local nodeEnv=${1:-now}

  local envDockerDir=${projectDir}/${DockerfilePath}/${nodeEnv}
  resetDir
  baseBuild ${nodeEnv} ${envDockerDir} ${buildDir}

  resetDir
  cd production
  gsed -i 's/"start": ".*/"start": "PORT=1337 NODE_ENV=now node .\/index.js",/g' package.json

  now --public -t ${nowToken} ${nowAppend}
}


deleteOldVersion
deploy
