#!/usr/bin/env bash

nodeEnv="leancloud";
prettyLog="1";
remoteOrigin="git@production.coding.net:shangxin/Production.git"

projectDir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && cd .. && pwd )"

projectName=`cat ${projectDir}"/package.json" | grep -E "\"name\"(.*?)" | sed "s/\"name\": \"\([^\"]*\)\",/\1/g" | xargs -I {} echo {}`
echo "projectName: "${projectName}

function resetDir() {
  cd ${projectDir}
}

function initRemote() {
  resetDir
  mkdir -p ./production
  cd ./production
  localRepoDir=`git remote -v | grep -E "production\s+${remoteOrigin}\s+\(push\)"`
  if [ -z "$localRepoDir" ]
  then
    git init
    git remote add production ${remoteOrigin}
  else
    echo ${localRepoDir}
  fi
  resetDir
}

function pushCoding() {
  resetDir
  initRemote
	if [ -n "$1" ]
	then
	  echo "set projectName to $1";
	  projectName=$1;
	fi

	if [ -n "$2" ]
	then
		echo "set NODE_ENV to $2";
	  nodeEnv=$2;
	fi

	if [ -n "$3" ]
	then
		echo "set PRETTY_LOG to $3";
	  prettyLog=$3;
	fi

	gulp prod
	echo "cp ./package.json ./production/"
	cp ./package.json ./production/

	if [ -e ./config/Dockerfiles/${nodeEnv} ]
	then
	  cp ./config/Dockerfiles/${nodeEnv} ./production/Dockerfile
	else
	  echo "no ${nodeEnv} Dockerfile, skip"
	fi

	gsed -i "s/\"start\": \".*/\"start\": \"NODE_ENV=${nodeEnv} PRETTY_LOG=${prettyLog} pm2 start .\/index.js --no-daemon\",/g" ./production/package.json
	cd ./production
	git add -A
	now=`date +%Y_%m_%d_%H_%M_%S`
	git commit -m "${now}"  || echo "nothing to commit"
	echo "git push -u production master:${projectName} -f"
	git push -u production master:${projectName} -f
	resetDir
}

pushCoding $*