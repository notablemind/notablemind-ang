REPORTER = spec

build: components node_modules
	@component build --dev --use component-stylus

components: component.json
	@component install

node_modules:
	@npm install

server:
	supervisor app.js

template_files := $(patsubst assets/jade/%.jade,static/%.html,$(wildcard assets/jade/*.jade))

templates: $(template_files)

static/%.html: assets/jade/%.jade
	@jade -o static $<

watch-jade:
	jade -w -P assets/jade -o static/

watch-styl:
	stylus --watch assets/styl -o static/css/

watch-test:
	supervisor -n exit -w lib,test -e txt,js -x make -- test -B -s

watch-cov:
	supervisor -n exit -w lib,test -e txt,js -x make -- test-cov -B -s

test: lib
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
