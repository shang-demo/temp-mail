.PHONY:*

gulp:
	@ gulp
build:
	@ bash config/script-tools/index.sh build $(RUN_ARGS)
push:
	@ bash config/script-tools/index.sh push $(RUN_ARGS)
test:
	@ bash config/script-tools/index.sh test $(RUN_ARGS)
now:
	@ # make now -- XXX
	@ # will do now -t token XXXX
	@ bash config/script-tools/index.sh now $(RUN_ARGS)
copy:
	@ bash config/script-tools/copy.sh $(RUN_ARGS)
merge:
	git fetch template v3
	git merge remotes/template/v3
rsync:
	cp ./package.json ./production 
	gsed -i 's/"start": ".*/"start": "pm2 stop temp-email-backend \|\| echo \\"\\" \&\& $(prodNodeEnv) pm2 start .\/index.js --name temp-email-backend --update-env",/g' ./production/package.json
	rsync --exclude .tmp --exclude node_modules -azvP -e "ssh -p 22" ./production/ root@112.74.107.82:/root/production/temp-email-backend
	ssh -p 22 root@112.74.107.82  ". /etc/profile; cd /root/production/temp-email-backend; npm start; sleep 3; pm2 logs 13 --lines 20 --nostream"


ifeq ($(firstword $(MAKECMDGOALS)), $(filter $(firstword $(MAKECMDGOALS)),build push now))
  # use the rest as arguments for "run"
  RUN_ARGS := $(wordlist 2,$(words $(MAKECMDGOALS)),$(MAKECMDGOALS))
  # ...and turn them into do-nothing targets
  $(eval $(RUN_ARGS):;@:)
endif