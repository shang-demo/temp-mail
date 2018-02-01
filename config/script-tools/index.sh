#!/usr/bin/env bash

# 先检查 依赖 jq
function _checkDependence() {
	if ! command -v ${1} > /dev/null 2>&1;then
    echo "no ${1} found, please use: \n brew install ${1}"
    exit 1;
	fi
}

_checkDependence jq

# 定义全局变量
scriptDir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
projectDir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && cd ../.. && pwd )"
projectName=$( cat ${projectDir}/package.json | jq -r '.name' )

defaultConfigPath="config/remote.config.json"
defaultCopyScriptPath="config/script-tools/copy.sh"
DockerfilePath="config/Dockerfiles"
defaultEnv="leancloud"
buildDir="production"

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

# 载入公共函数
source util.sh

# 参数判断
while [[ $# -gt 0 ]]
do
key="$1"
case ${key} in
    build)
    shift 1
    source build.sh $*
    shift $#
    ;;
    push)
    shift 1
    source push.sh $*
    shift $#
    ;;
    test)
    shift 1
    source test.sh $*
    shift $#
    ;;
    copy)
    shift 1
    echo "=== copy $* ==="
    source copy.sh $*
    shift $#
    ;;
    now)
    shift 1
    source now.sh $*
    shift $#
    ;;
    *)
    echo ${key}
    shift
    ;;
esac
done
