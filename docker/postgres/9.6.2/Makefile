REPO = repo.devpack.cc
NS = susan_hsieh
VERSION = 9.6.2
CONTEXT = ./

.PHONY: build push

build: Dockerfile
	docker build --no-cache -t $(REPO)/$(NS)/postgres:$(VERSION) -f $^ $(CONTEXT)

push:
	docker push $(REPO)/$(NS)/postgres:$(VERSION)
