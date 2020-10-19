REPO = repo.devpack.cc
NS = billypong
VERSION = test
CONTEXT = ./

.PHONY: build push

build: Dockerfile-license
	docker build --no-cache -t $(REPO)/$(NS)/license-tool:$(VERSION) -f $^ $(CONTEXT)

push:
	docker push $(REPO)/$(NS)/license-tool:$(VERSION)
