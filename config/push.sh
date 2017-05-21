#!/usr/bin/env bash

trap "exit 1" TERM
export TOP_PID=$$

projectDir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && cd .. && pwd )"

function resetDir() {
  cd ${projectDir}
}

function getConfig() {
  configName=${1};
  configDefaultValue=${2-""}
  configFile=${3-"config/push.config.json"};

  if [ -z "${configName}" ]
  then
    echo "no config name found";
    # 退出不再执行
    kill -s TERM ${TOP_PID}
    exit 1;
  fi

  if [ ! -f "${projectDir}/config/push.config.json" ]
  then
    echo "${projectDir}/config/push.config.json not found";
    # 退出不再执行
    kill -s TERM ${TOP_PID}
    exit 1;
  fi


  value=`cat ${projectDir}/${configFile} | jq -r ".${configName}"`;
  if [ -z "${value}" -o ${value} = "null" ]
  then
    value=${2}
  fi

  echo ${value};
}

function currentBranch() {
  git rev-parse --abbrev-ref HEAD
}

function pushDeploy() {
  resetDir

  nodeEnv=${1}

  gulp buildServer
  echo "cp ./package.json ./production/"
	cp ./package.json ./production/

	currentBranch=`git rev-parse --abbrev-ref HEAD`
	currentHead=`git rev-parse HEAD`
	pushDate=`date +%Y_%m_%d_%H_%M_%S`

	echo ${currentBranch}-${pushDate}-${currentHead} > ./production/config/version.txt

  if [ -e ./config/Dockerfiles/${nodeEnv} ]
	then
	  cp ./config/Dockerfiles/${nodeEnv} ./production/Dockerfile
	else
	  echo "no ${nodeEnv} Dockerfile, skip"
	fi

  cd production
  cat package.json | jq ".scripts.start=\"NODE_ENV=${nodeEnv} pm2-docker start .\/index.js --raw\" | .devDependencies={}" > __package__.json
	rm package.json
	mv __package__.json package.json

	push deploy
}


function initGit() {
  remoteName=$1;
  url=$2;

  # 获取remote url
  remoteVerbose=`git remote -v | grep -E "${remoteName}\s+.+push)"`

  if [ -z "${remoteVerbose}" ]
  then
    if [ -z "${url}" ]
    then
      echo "set push url at config/push.config.json"

      kill -s TERM ${TOP_PID}
      exit 1
    fi

    git init
    echo "git remote add ${remoteName} ${url}"
    git remote add ${remoteName} ${url}
  fi
}

function push() {
  env=${1:-dev};

  pushUrl=$(getConfig "${env}.url")
	pushRemote=$(getConfig "${env}.remote" "origin")
  currentBranch=$(currentBranch)
	pushBranch=$(getConfig "${env}.branch")

	if [ ${pushBranch} = "__package_name__" ]
	then
	  pushBranch=$(getConfig "name" "" "package.json")
	elif [ -z "${pushBranch}" -o ${pushBranch} = "null" ]
	then
	  pushBranch=${currentBranch}
	fi

  initGit ${pushRemote} ${pushUrl}

  if [ ${env} = "deploy" ]
  then
    git add -A
    now=`date +%Y_%m_%d_%H_%M_%S`
    git commit -m "${now}" || echo ""
    echo "git push ${pushRemote} ${currentBranch}:${pushBranch} -f"
	  git push ${pushRemote} ${currentBranch}:${pushBranch} -f
  else
    echo "git push ${pushRemote} ${currentBranch}:${pushBranch}"
	  git push ${pushRemote} ${currentBranch}:${pushBranch}
	fi
}


function checkDependence() {
	if ! command -v ${1} > /dev/null 2>&1;then
    echo "no ${1} found, please use: \nbrew install ${1}"
    exit 1;
	fi
}

function checkDependencies() {
	checkDependence gsed
	checkDependence jq
}

function lift() {
  env=${1:-dev}
  nodeEnv=${2:-leancloud}

  checkDependencies

  if [ ${env} = "deploy" ]
  then
    pushDeploy ${nodeEnv}
  else
    push
	fi
}

lift $*