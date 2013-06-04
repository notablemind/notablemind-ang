REPORTER = spec

build: components
	@component build

components: component.json
	@component install

server:
	supervisor app.js

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

test-cov=coverage.html
coverage.html: lib-cov test
	@EXPRESS_COV=1 $(MAKE) --no-print-directory test -B REPORTER=html-cov > coverage.html
	@touch coverage.html

lib-cov: lib
	@jscoverage --no-highlight lib lib-cov
	@touch lib-cov

.PHONY: test-cov
