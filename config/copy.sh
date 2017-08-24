#!/usr/bin/env bash

trap "exit 1" TERM
export TOP_PID=$$

projectDir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && cd .. && pwd )"

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

function initProject() {
	mergeBranch=$(getConfig "merge.branch")
	mergeUrl=$(getConfig "merge.url")
	mergeRemote=$(getConfig "merge.remote")

	if [ -z "$1" ]
	then
	  echo "need param 'd' to set copy dir"

	  kill -s TERM ${TOP_PID}
    exit 1
  fi

	if [[ $1 = /* ]]
  then
    cpDir=$1
  else
    cpDir="../../$1"
  fi
  projectName=`basename ${cpDir}`


	if [ -e ${cpDir} ]
	then
		echo "${cpDir} 目录存在!!";

		kill -s TERM ${TOP_PID}
    exit 1
	fi

	mkdir -p ${cpDir};
	cd ${cpDir};
	git init;
	git remote add ${mergeRemote} ${mergeUrl};
	git remote -v;
	git fetch ${mergeRemote} ${mergeBranch};
	git checkout -b master remotes/${mergeRemote}/${mergeBranch};

  # change merge branch
	gsed -i "s|__template_remote__|${mergeRemote}|g" Makefile
	gsed -i "s|__template_branch__|${mergeBranch}|g" Makefile
  # change project name and push remote
	cat package.json | jq ".name=\"${projectName}\" | .version=\"0.0.1\"" > __package__.json
	rm package.json
	mv __package__.json package.json

	cat config/push.config.json | jq "del(.merge) | .dev.url=\"\" | .dev.remote=\"origin\" | .dev.branch=\"\"" > config/__push.config.json__
	rm config/push.config.json
	mv config/__push.config.json__ config/push.config.json

	rm config/copy.sh

	echo "# ${projectName}" > README.md

	git add -A;
	git commit -m "init project";
	yarnpkg
}

function checkDependence() {
	if ! command -v ${1} > /dev/null 2>&1;then
    echo "no ${1} found, please use: \nbrew install ${1}"

    kill -s TERM ${TOP_PID}
    exit 1
	fi
}

function checkDependencies() {
	checkDependence gsed
	checkDependence jq
}

checkDependencies
initProject $*
