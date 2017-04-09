#!/usr/bin/env bash

trap "exit 1" TERM
export TOP_PID=$$

function getConfig() {
  configName=${1};
  if [ -z "${configName}" ]
  then
    echo "no config name found";
    # 退出不再执行
    kill -s TERM ${TOP_PID}
    exit 1;
  fi

  value=`cat package.json | jq -r ".${configName}"`;
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
  #    npm run build:aot:prod
  mkdir -p dist
  cp package.json dist/
  cd dist

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
      echo "set push url at package.json"

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

  pushUrl=$(getConfig "push.${env}.url")
	pushRemote=$(getConfig "push.${env}.remote" "origin")
  currentBranch=$(currentBranch)
	pushBranch=$(getConfig "push.${env}.branch")

	if [ ${pushBranch} = "__package_name__" ]
	then
	  pushBranch=$(getConfig "name")
	elif [ -z "${pushBranch}" -o ${pushBranch} = "null" ]
	then
	  pushBranch=${currentBranch}
	fi

  initGit ${pushRemote} ${pushUrl}

  if [ ${env} = "deploy" ]
  then
    #  gitlab pages need
    cp config/gitlab-ci-template.yml dist/.gitlab-ci.yml
    gsed -i "s|__branch_name__|${pushBranch}|g" dist/.gitlab-ci.yml
    
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

  checkDependencies

  if [ ${env} = "deploy" ]
  then
    pushDeploy
  else
    push
	fi
}

lift $*