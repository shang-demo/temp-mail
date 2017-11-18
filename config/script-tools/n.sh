#!/usr/bin/env bash

function sourcePrivateEnv() {
  cd "config/script-tools"
  local privateEnv=$( ls -a \
  | grep -E "private-.*\.sh" \
  | grep -v "private-env.default.sh")

  echo "privateEnv:"${privateEnv}

  declare -a arr=(${privateEnv})

  for word in ${arr[@]}
  do
      source ${word}
  done
}

# 先载入私有环境
sourcePrivateEnv

function n() {
  now $* -t ${nowToken}
}