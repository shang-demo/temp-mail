.PHONY: all test clean static
d=template2
gulp:
	@ gulp
test:
	@ if [ -n "$(g)" ]; \
	then \
		echo 'mocha --recursive --timeout 10000 --require chai --harmony --bail -g $(g) test'; \
		mocha --recursive --timeout 10000 --require chai --harmony --bail -g $(g) test; \
	else \
		echo 'mocha --recursive --timeout 10000 --require chai --harmony --bail test'; \
		mocha --recursive --timeout 10000 --require chai --harmony --bail test; \
	fi
prod:
	gulp prod
	NODE_ENV=production PRETTY_LOG=1 node production/app.js
pushHeroku: 
	cp ./package.json ./production
	gsed -i 's/"start": ".*/"start": "NODE_ENV=heroku pm2 start .\/index.js --no-daemon",/g' ./production/package.json
	cd ./production && git add -A && git commit -m "auto" && git push heroku master && heroku logs --tail
merge:
	git fetch __template_remote__ __template_branch__
	git merge remotes/__template_remote__/__template_branch__
push:
	@ bash config/script-tools/push-git.sh
deploy:
	@ bash config/script-tools/push-git.sh prod $(e)
copy:
	@ bash config/script-tools/copy.sh $(d)
rsync:
	cp ./package.json ./production
	gsed -i 's/"start": ".*/"start": "PORT=1337 NODE_ENV=production pm2 start .\/index.js --name template:1337",/g' ./production/package.json
	rsync --exclude .tmp --exclude node_modules -cazvF -e "ssh -p 22" ./production/  feng@139.129.92.153:/home/feng/shang/template/$(templateVersion)