REPO = repo.devpack.cc
NS = billy_pong
VERSION = 1.1.2-rc2
CONTEXT = ./

.PHONY: build push

docker-build: Dockerfile-nexe
	docker build --no-cache -t $(REPO)/$(NS)/nexe:$(VERSION) -f $^ $(CONTEXT)

docker-push:
	docker push $(REPO)/$(NS)/nexe:$(VERSION)
