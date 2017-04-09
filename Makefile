.PHONY: push start pushProd copy
start:
	npm run start:hmr
merge:
	git fetch template __template_branch__
	git merge remotes/template/__template_branch__
push:
	@ sh config/push.sh
deploy:
	@ sh config/push.sh deploy
copy:
	@ sh config/copy.sh $(d)
