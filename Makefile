.PHONY: all test clean static
d=template2
templateVersion=v2
node-dev:
	node-dev --respawn server/index.js
merge:
	git fetch template $(templateVersion)
	git merge remotes/template/$(templateVersion)
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
dev:
	@ sh ./config/start.sh
pushProd:
	@ sh ./config/push.sh
copy:
	@ sh ./config/copy.sh $(d)
static:
	gulp static
	cd static && hs
rsync:
	cp ./package.json ./production
	gsed -i 's/"start": ".*/"start": "PORT=1337 NODE_ENV=production pm2 start .\/index.js --name template:1337",/g' ./production/package.json
	rsync --exclude .tmp --exclude node_modules -cazvF -e "ssh -p 22" ./production/  feng@139.129.92.153:/home/feng/shang/template/$(templateVersion)