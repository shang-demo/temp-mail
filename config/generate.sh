#!/usr/bin/env bash

trap "exit 1" TERM
export TOP_PID=$$

currentFilePath="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd -P)"

function checkDependence() {
	if ! command -v ${1} > /dev/null 2>&1;then
    echo "no ${1} found, please use: \nbrew install ${1}"

    kill -s TERM ${TOP_PID}
    exit 1
	fi
}

function checkDependencies() {
	checkDependence touch
	checkDependence gsed
}

function createFile() {
  name=${1}
  dirPath="../src/app/${1}";
  filePath="${dirPath}/${1}.${2}";

  mkdir -p ${dirPath}
  touch ${filePath}

  if [ "${2}" = "index.ts"  ]
  then
    eval getIndexStr ${1} > ${filePath}
  elif [ "${2}" = "component.ts" ]
  then
    eval getComponentTsStr ${1} > ${filePath}
  fi
}

function Capitalized() {
  echo ${1} | gsed "s/\b[a-z]/\U&/gi"
}

function getIndexStr() {
  echo "export * from './${1}.component';";
}

function getComponentTsStr() {
  name=${1}
  ClassName=$(Capitalized ${name})

  str="import { Component, OnInit } from '@angular/core';

  @Component({
    selector: '${name}',  // <${name}></${name}>
    providers: [],
    styleUrls: ['./${name}.component.scss'],
    templateUrl: './${name}.component.html'
  })

  export class ${ClassName}Component implements OnInit {
    public ngOnInit() {
      console.log('hello \`${ClassName}\` component');
    }
  }"

  echo "${str}"
}

function createFiles() {
  name=${1};
  cd ${currentFilePath}
  dirPath="../src/app/${1}";
  if [ -e ${dirPath} ]
	then
		echo "${dirPath} 目录存在!!";

		kill -s TERM ${TOP_PID}
    exit 1
	fi

  createFile ${name} component.html
  createFile ${name} component.scss
  createFile ${name} component.ts
  createFile ${name} index.ts
}

checkDependencies
createFiles $*