REPO = repo.devpack.cc
NS = bestshape
VERSION := 2.4
COMMIT := $(shell git rev-parse HEAD | cut -c1-6)
CONTEXT = ../

.PHONY: build push jenkins-push jenkins-check

docker-build:
	sudo docker build --no-cache -t $(REPO)/$(NS)/hd-web-portal:$(VERSION)-$(COMMIT) -f Dockerfile $(CONTEXT)

docker-push:
	sudo docker tag $(REPO)/$(NS)/hd-web-portal:$(VERSION)-$(COMMIT) $(REPO)/$(NS)/hd-web-portal:latest
	sudo docker push $(REPO)/$(NS)/hd-web-portal:$(VERSION)-$(COMMIT)
	sudo docker push $(REPO)/$(NS)/hd-web-portal:latest
