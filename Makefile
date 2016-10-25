.PHONY: all test clean static
d='template2'
dev:
	@sh config/start.sh
node-dev:
	node-dev app/app.js
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
	node production/app.js
pushHeroku: 
	cp ./package.json ./production
	gsed -i 's/"start": "NODE_ENV=.*/"start": "NODE_ENV=heroku pm2 start .\/app.js --no-daemon",/g' ./production/package.json
	cd ./production && git add -A && git commit -m "auto" && git push heroku master && heroku logs --tail
static:
	gulp static
	cd static && hs
copy:
	cp -r ./ ../$(d)
	if [ -n "$(b)" ]; \
	then \
		rm -rf ../$(d)/app/public; \
		rm -rf ../$(d)/config/gulp/config.js; \
		mv ../$(d)/config/gulp/backendConfig.js ../$(d)/config/gulp/config.js; \
		rm -rf ../$(d)/app/views/index.html; \
		mv ../$(d)/app/views/backendIndex.html ../$(d)/app/views/index.html; \
	else \
		rm -rf ../$(d)/config/gulp/backendConfig.js; \
		rm -rf ../$(d)/app/views/backendIndex.html; \
	fi
	rm -rf ../$(d)/.idea
	rm -rf ../$(d)/.git
	cd ../$(d)/
rsync:
	cp ./package.json ./production
	gsed -i 's/"start": "NODE_ENV=.*/"start": "PORT=1337 NODE_ENV=production pm2 start .\/app.js --name template:1337",/g' ./production/package.json
	rsync --exclude .tmp --exclude node_modules -cazvF -e "ssh -p 22" ./production/  root@139.129.92.153:/root/shang/template