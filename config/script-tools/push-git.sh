#!/usr/bin/env bash

scriptDir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
projectDir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && cd ../.. && pwd )"

# 载入依赖
cd ${scriptDir}
source constants.sh
source util.sh
source build.sh

function resetDir() {
  cd ${projectDir}
}

function checkDependencies() {
	_checkDependence gsed
	_checkDependence jq
}

function push() {

  local env=${1:-dev}
  local nodeEnv=${2:-${defaultEnv}}

  resetDir
  if [ ${env} = "prod" ]
  then
    cd ${buildDir}
  fi

  local pushInfo=( $(_getPushInfo ${projectDir}/${defaultConfigPath} ${projectDir} ${env}) )

  echo ${pushInfo[*]}

  local pushUrl=${pushInfo[0]}
  local pushRemote=${pushInfo[1]}
  local currentBranch=${pushInfo[2]}
  local pushBranch=${pushInfo[3]}

  _initGit ${pushRemote} ${pushUrl}

  if [ ${env} = "prod" ]
  then
    local envDockerDir=${projectDir}/${DockerfilePath}/${nodeEnv}
    resetDir
    baseBuild ${nodeEnv} ${envDockerDir} ${buildDir}

    cd ${buildDir}
    git add -A
    now=`date +%Y_%m_%d_%H_%M_%S`
    git commit -m "${now}" || echo ""
    echo $(pwd)
    echo "git push ${pushRemote} ${currentBranch}:${pushBranch}(${nodeEnv}) -f"
	  git push ${pushRemote} ${currentBranch}:${pushBranch}\(${nodeEnv}\) -f
  else
    echo $(pwd)
    echo "git push ${pushRemote} ${currentBranch}:${pushBranch}"
	  git push ${pushRemote} ${currentBranch}:${pushBranch}
	fi
}


function lift() {
  checkDependencies

  push $*
}

lift $*