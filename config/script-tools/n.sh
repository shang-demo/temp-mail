#!/usr/bin/env bash

# 载入依赖
source config/script-tools/constants.sh

function n() {
  now $* -t ${nowToken}
}