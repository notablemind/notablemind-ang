REPORTER = spec

build: components node_modules static static/css
	@component build --dev --use component-stylus

local_build: components node_modules static static/css
	@./node_modules/.bin/component build --dev --use component-stylus

heroku: local_build templates
	@node app.js

components: component.json
	@./node_modules/.bin/component install

node_modules:
	@npm install

serve: build templates
	nodemon app.js

static: assets/jade
	jade -P assets/jade -o static/

template_files := $(patsubst assets/jade/%.jade,static/%.html,$(wildcard assets/jade/*.jade))

templates: $(template_files)

static/%.html: assets/jade/%.jade
	@./node_modules/.bin/jade -o static $<

watch-jade:
	jade -w -P assets/jade -o static/

static/css: assets/styl
	stylus assets/styl -o static/css/

watch-styl:
	stylus --watch assets/styl -o static/css/

watch-test:
	supervisor -n exit -w lib,test -e txt,js -x make -- test -B -s

watch-cov:
	supervisor -n exit -w lib,test -e txt,js -x make -- test-cov -B -s

test:
	@echo "No tests yet"

oldtest: lib
	@NODE_ENV=test ./node_modules/.bin/mocha \
		--reporter $(REPORTER)
	@touch test

reboot:
	@rm -rf node_modules components

subrepos := $(wildcard components/*/.git)

git-up:
	@for dir in $(subrepos); do \
		echo $$dir; cd $$dir/.. && git pull; cd -; \
	done
	git pull

test-cov=coverage.html
coverage.html: lib-cov test
	@EXPRESS_COV=1 $(MAKE) --no-print-directory test -B REPORTER=html-cov > coverage.html
	@touch coverage.html

lib-cov: lib
	@jscoverage --no-highlight lib lib-cov
	@touch lib-cov

.PHONY: test-cov git-up test
