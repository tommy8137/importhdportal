REPO = repo.devpack.cc
NS = billypong
VERSION = 9.5
CONTEXT = ./

.PHONY: build push

build: Dockerfile-postgres
	docker build --no-cache -t $(REPO)/$(NS)/postgres:$(VERSION) -f $^ $(CONTEXT)

push:
	docker push $(REPO)/$(NS)/postgres:$(VERSION)
