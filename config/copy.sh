function initProject() {
	templateVersion=v2
	projectName=template2;
	cpDir="../../${projectName}"

	if [ -n "$1" ]
	then
		projectName=$1
		cpDir="../../$1"
	  echo "copy to ${cpDir}"
	fi

	if [ -e ${cpDir} ]
	then 
		echo "${cpDir} 目录存在!!"; 
		exit 1; 
	fi

	mkdir -p ${cpDir}; 
	cd ${cpDir}; 
	git init; 
	git remote add template https://git.coding.net/xinshangshangxin/clientTemplate.git; 
	git remote -v; 
	git fetch template ${templateVersion}; 
	git checkout ${templateVersion}; 
	git checkout -b master; 
	gsed -i "s/\"name\": \".*/\"name\": \"${projectName}\",/g" package.json; 
	rm config/copy.sh
	git add -A; 
	git commit -m "init project"; 
	yarnpkg
}

initProject $*

