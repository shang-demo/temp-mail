.PHONY: push start pushProd copy
start:
	npm run start:hmr
merge:
	git fetch template v3
	git merge remotes/template/v3
push:
	@ sh config/push.sh
deploy:
	@ sh config/push.sh deploy
copy:
	@ sh config/copy.sh $(d)
