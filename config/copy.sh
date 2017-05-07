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

function initProject() {
	templateVersion=$(getConfig "push.dev.branch")
	templateRemote=$(getConfig "push.dev.url")

	if [ -n "$1" ]
	then
		projectName=$1
		cpDir="../../$1"
	  echo "copy to ${cpDir}"
	else
	  echo "need param 'd' to set copy dir"

	  kill -s TERM ${TOP_PID}
    exit 1
	fi

	if [ -e ${cpDir} ]
	then
		echo "${cpDir} 目录存在!!";

		kill -s TERM ${TOP_PID}
    exit 1
	fi

	mkdir -p ${cpDir};
	cd ${cpDir};
	git init;
	git remote add template ${templateRemote};
	git remote -v;
	git fetch template ${templateVersion};
	git checkout ${templateVersion};
	git checkout -b master;

  # change merge branch
	gsed -i "s|__template_branch__|${templateVersion}|g" Makefile
  # change project name and push remote
	cat package.json | jq ".name=\"${projectName}\" | .version=\"0.0.1\" | .push.dev.url=\"\" | .push.dev.remote=\"origin\" | .push.dev.branch=\"\"" > __package__.json
	rm package.json
	mv __package__.json package.json
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
