.PHONY: all test clean static
d=template2
dev:
	@sh config/start.sh
node-dev:
	node-dev --respawn server/index.js
push:
	git push origin template
merge:
	git fetch template template
	git merge remotes/template/template
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
pushProd:
	@ sh ./config/push.sh
static:
	gulp static
	cd static && hs
copy:
	@ if [ -e ../$(d)/ ]; \
	then \
		echo "../$(d)/ 目录存在!!"; \
		exit 1; \
	fi
	mkdir -p ../$(d)/
	cd ../$(d); \
	git init; \
	git remote add template https://git.coding.net/xinshangshangxin/mkoa.git; \
	git remote -v; \
	git fetch template template; \
	git checkout template; \
	git checkout -b master; \
	sed -i 's/"name": ".*/"name": "$(d)",/g' package.json; \
	yarn 
rsync:
	cp ./package.json ./production
	gsed -i 's/"start": ".*/"start": "PORT=1337 NODE_ENV=production pm2 start .\/index.js --name template:1337",/g' ./production/package.json
	rsync --exclude .tmp --exclude node_modules -cazvF -e "ssh -p 22" ./production/  feng@139.129.92.153:/home/feng/shang/template