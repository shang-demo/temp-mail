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
	git fetch __template_remote__ __template_branch__
	git merge remotes/__template_remote__/__template_branch__
rsync:
	cp ./package.json ./production
	gsed -i 's/"start": ".*/"start": "PORT=8080 NODE_ENV=production pm2 start .\/index.js --name __project__name__:8080",/g' ./production/package.json
	rsync --exclude .tmp --exclude node_modules -cazvF -e "ssh -p 22" ./production/ root@112.74.107.82:/root/production/__project__name__


ifeq ($(firstword $(MAKECMDGOALS)), $(filter $(firstword $(MAKECMDGOALS)),build push now))
  # use the rest as arguments for "run"
  RUN_ARGS := $(wordlist 2,$(words $(MAKECMDGOALS)),$(MAKECMDGOALS))
  # ...and turn them into do-nothing targets
  $(eval $(RUN_ARGS):;@:)
endif