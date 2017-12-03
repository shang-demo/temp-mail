#!/usr/bin/env bash

scriptDir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
projectDir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && cd ../.. && pwd )"
projectName=$( cat ${projectDir}/package.json | jq -r '.name' )

cd ${scriptDir}

function sourcePrivateEnv() {
  local privateEnv=$( ls -a \
   | grep -E "private-.*\.sh" \
   | grep -v "private-env.default.sh")

  declare -a arr=(${privateEnv})

  for word in ${arr[@]}
  do
      source ${word}
  done
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

function getAllDeployments() {
  echo $(curl -s --request GET \
   --url https://api.zeit.co/now/deployments \
   --header "authorization: Bearer ${nowToken}" \
   | jq ".deployments | sort_by(.created) | reverse")
}

function getDeployments() {
  echo $(curl -s --request GET \
   --url https://api.zeit.co/now/deployments \
   --header "authorization: Bearer ${nowToken}" \
   | jq "[.deployments[] | select(.name | contains(\"${projectName}\"))]  | sort_by(.created) | reverse")
}

function deleteOldVersion() {
  local deployments=$(getDeployments)
  local maintainUid=$( echo ${deployments} | jq '[.[] | select(.state == "READY" | "FROZEN")] | first | .uid' )

  local deleteUidList=$( echo $( echo ${deployments} | jq ".[] | select(.uid != ${maintainUid}) | .uid" ) )

  echo "deleteUidList: ${deleteUidList}"
  echo ""

  declare -a arr=(${deleteUidList})

  for word in ${arr[@]}
  do
      echo ${word} | gsed -E "s/\"(.*)\"/\1/gi" | xargs -I {} curl -s --request DELETE --url https://api.zeit.co/now/deployments/{} --header "authorization: Bearer ${nowToken}"
  done
}


function build() {
  local nodeEnv=${1:-now}

  local envDockerDir=${projectDir}/${DockerfilePath}/${nodeEnv}
  resetDir
  baseBuild ${nodeEnv} ${envDockerDir} ${buildDir}
}

function deploy() {

  resetDir
  cd production
  echo "now -t ${nowToken} -n ${projectName} --public ${nowAppend}"
  now -t ${nowToken} -n ${projectName} --public -C ${nowAppend}
}

function logs() {
  local deployments=$(getDeployments)
  local firstUid=$( echo ${deployments} | jq -r '. | first | .uid' )

  local logsConfig="${firstUid} -f"
  local isNu=$(isNumber $1)

  if [ -n "$1" ] && [ ${isNu:-0} -eq 1 ]
  then
    logsConfig="${logsConfig} -n $1"
  else
    logsConfig="${logsConfig} $*"
  fi

  echo "now -t ${nowToken} logs ${logsConfig}"
  now -t ${nowToken} logs ${logsConfig}
}

function getFirstDeployment() {
  local name=${1}
  echo $(curl -s --request GET \
   --url https://api.zeit.co/now/deployments \
   --header "authorization: Bearer ${nowToken}" \
   | jq -r "[.deployments[] | select(.name | contains(\"${name}\"))]  | sort_by(.created) | reverse | first | .uid")
}

function alias() {
  local name=${1-${projectName}}
  local uid=$( getFirstDeployment ${projectName} )

  echo "uid: "${uid}
  echo "name: "${name}

  curl -s --request POST \
   --url https://api.zeit.co/now/deployments/${uid}/aliases \
   --header "authorization: Bearer ${nowToken}" \
   --data "{\"alias\": \"${projectName}.now.sh\"}" \
   | jq -r "."
}

function getProjectAlias() {
  curl -s --request GET \
   --url https://api.zeit.co/now/aliases \
   --header "authorization: Bearer ${nowToken}" \
   | jq -r ".aliases | sort_by(.created) | reverse | [ .[] | select(.alias | contains(\"${projectName}\")) ] | first";
}


if [ -z "$*" ]
then
  deleteOldVersion
  build
  deploy
  alias
  getProjectAlias
elif [ "$1" = "build" ]
then
  build
elif [ "$1" = "deploy" ]
then
  deploy
elif [ "$1" = "logs" ]
then
  argv=( "$@" )
  logs ${argv[@]:1}
elif [ "$1" = "remove" ]
then
  deleteOldVersion
elif [ "$1" = "list" ]
then
   echo $( getAllDeployments ) | jq
elif [ "$1" = "alias" ]
then
  alias
  getProjectAlias
else
  echo "now -t ${nowToken} $*"
  now -t ${nowToken} $*
fi


