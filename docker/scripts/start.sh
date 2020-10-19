#!/bin/bash

set -e

APP=universal_webserver
PORT=8080
EL_IP=210.200.13.224
EL_PORT=5500
REDIS_NAME=redis_for_store_token
REDIS_IP=
REDIS_PORT=6379
VERSION=0.2.0

#start redis server
docker run --name ${REDIS_NAME} -d redis
REDIS_IP=$(sudo docker inspect --format '{{ .NetworkSettings.IPAddress }}' ${REDIS_NAME})
echo "Redis started at: ${REDIS_IP}"

docker run -d -p 5503:${PORT} --name ${APP} -e elip=${EL_IP} -e elport=${EL_PORT} -e redisip=${REDIS_IP} -e redisport=${REDIS_PORT} \
    -e port=${PORT} repo.devpack.cc/ilunchen/universal-webserver:${VERSION}

