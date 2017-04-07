.PHONY: push start
start:
	npm run start:hmr
push:
	git push template v2
copy:
	@ sh config/copy.sh $(d)
