.PHONY: build

build:
	sudo docker run --rm \
	  -v `pwd`:/web-portal \
	  -t node:6.9.2-alpine sh -x -c '\
	    apk update && \
	    apk upgrade && \
	    apk add --no-cache git python make g++ openssl && \
	    cd /web-portal && \
	    ln -s /web-portal/tools/yarn/bin/yarn /usr/local/bin/yarn && \
	    yarn install --ignore-engines && \
	    npm install -S git+https://gitlab.devpack.cc/susan_hsieh/gulp-javascript-obfuscator.git && \
	    wget -qO- "https://github.com/dustinblackman/phantomized/releases/download/2.1.1/dockerized-phantomjs.tar.gz" | tar xz -C / && \
	    npm install phantomjs && \
		rm -rf node_modules/chalk/ && \
		npm install chalk@1.1.3 && \
		rm -rf node_modules/run-sequence/ && \
		cp -r tools/run-sequence node_modules/ && \
	    yarn run generate-https-cert && \
	    yarn run generate-jwt-keys && \
	    yarn run generate-license-pwd && \
	    yarn run maya-jwt-keys && \
	    yarn run build && \
	    yarn run build-protected && \
	    yarn run test-obfuscator && \
	    cd build && \
	    yarn add --cwd . protobufjs@5.0.1 pg@6.0.2 mssql@3.3.0 radclient@1.0.0 html-pdf@2.1.0 \
	  '
	sudo docker run --rm \
	  -v `pwd`:/project \
	  -t repo.devpack.cc/billy_pong/nexe:1.1.2-rc2

docker-build:
	make docker-build -C docker

docker-push:
	make docker-push -C docker

docker-build-jenkins:
	make build -C docker/jenkins

docker-push-jenkins:
	make push -C docker/jenkins

docker-build-fail2ban:
	make build -C docker/fail2ban

docker-push-fail2ban:
	make push -C docker/fail2ban

docker-build-license-tool:
	make build -C docker/license

docker-push-license-tool:
	make push -C docker/license

docker-build-postgres:
	make build -C docker/postgres

docker-push-postgres:
	make push -C docker/postgres

clean:
	sudo rm -rf build node_modules
