#!/usr/bin/env bash

scriptDir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
projectDir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && cd ../.. && pwd )"
projectName=$( cat ${projectDir}/package.json | jq -r '.name' )


# 载入依赖
cd ${scriptDir}
source constants.sh
source util.sh
source build.sh

function resetDir() {
  cd ${projectDir}
}


function getFirstDeployment() {
  local name=${1}
  echo $(curl --request GET \
   --url https://api.zeit.co/now/deployments \
   --header "authorization: Bearer ${nowToken}" \
   | jq -r "[.deployments[] | select(.name | contains(\"${name}\"))]  | sort_by(.created) | reverse | first | .uid")
}

function alias() {
  local name=${1-${projectName}}
  local uid=$( getFirstDeployment ${projectName} )

  echo "uid: "${uid}
  echo "name: "${name}

  curl --request POST \
   --url https://api.zeit.co/now/deployments/${uid}/aliases \
   --header "authorization: Bearer ${nowToken}" \
   --data "{\"alias\": \"${projectName}.now.sh\"}" \
   | jq -r "."
}

function getProjectAlias() {
  curl --request GET \
   --url https://api.zeit.co/now/aliases \
   --header "authorization: Bearer ${nowToken}" \
   | jq -r ".aliases | sort_by(.created) | reverse | [ .[] | select(.alias | contains(\"${projectName}\")) ] | first";
}

alias
getProjectAlias
