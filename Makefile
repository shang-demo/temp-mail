.PHONY: push start pushProd copy
start:
	npm run start:hmr
push:
	echo "you need define"
pushProd:
	npm run build:aot:prod; \
	cd dist; \
	git init; \
	git remote add coding git@git.coding.net:xinshangshangxin/site-crawler.git; \
	git add -A; \
	git commit -m "auto"; \
	git push coding master:coding-pages -f
copy:
	@ sh config/copy.sh $(d)
