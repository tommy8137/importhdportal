NS = billypong
VERSION = 6
REPO = repo.devpack.cc
CONTEXT = ../../

.PHONY: build push

build:
	docker build --no-cache -t $(REPO)/$(NS)/nodejs$(VERSION)-jenkins-slave -f Dockerfile-nodejs6-jenkins-slave $(CONTEXT)

push:
	docker push $(REPO)/$(NS)/nodejs$(VERSION)-jenkins-slave

build-nodejs6-sonar:
	docker build --no-cache -t $(REPO)/$(NS)/nodejs-sonar -f Dockerfile-nodejs6-sonar $(CONTEXT)/..

build-old:
	# base image for nodejs jenkins slave
	docker build --no-cache -t $(REPO)/$(NS)/nodejs-jenkins-slave:$(VERSION) -f Dockerfile-jenkins-slave $(CONTEXT)
	# nodejs jenkins slave with npm cache
	docker build --no-cache -t $(REPO)/$(NS)/nodejs-sonar -f Dockerfile-nodejs6-sonar $(CONTEXT)/..
