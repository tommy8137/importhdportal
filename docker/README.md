# jenkins docker images

## nodejs 6.x images for jenkins slave
```
$ docker build --no-cache -t repo.devpack.cc/billypong/jenkins-slave:nodejs-6.x -f docker/jenkins/Dockerfile-jenkins-slave .
```

## npm cache and sonar runner for web-portal
```
$ docker build --no-cache -t repo.devpack.cc/billypong/nodejs6-sonar -f docker/jenkins/Dockerfile-nodejs6-sonar .
```

# production

build nodejs base images
```
$ docker build --no-cache -t repo.devpack.cc/billypong/nodejs:6.2.2 -f docker/Dockerfile-node-base .
```

build production images
```
$ docker build --no-cache -t repo.devpack.cc/billypong/web-portal:<version> -f docker/Dockerfile-prod .
```

#  production - maya
build maya images in root folder
```
$make build-prod-maya

```
run maya images -
  input : /path/of/keys,docker-prod-maya-env
```
docker run  --name wiprognosis -d -p 443:8008 --env-file docker-prod-maya-env -v /path/of/keys:/web-portal-2.1/keys --privileged -t wiprognosis ./app.bin
```
