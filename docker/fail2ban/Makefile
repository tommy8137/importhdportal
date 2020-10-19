REPO = repo.devpack.cc
NS = billypong
VERSION = 0.1.0
CONTEXT = ./

.PHONY: build push

build: Dockerfile-fail2ban
	docker build --no-cache -t $(REPO)/$(NS)/fail2ban:$(VERSION) -f $^ $(CONTEXT)

push:
	docker push $(REPO)/$(NS)/fail2ban:$(VERSION)
