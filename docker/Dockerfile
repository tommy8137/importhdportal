FROM node:6.9.2-alpine

RUN apk add --no-cache dmidecode freetype fontconfig
RUN echo http://nl.alpinelinux.org/alpine/edge/testing >> /etc/apk/repositories && \
    apk add --no-cache wqy-zenhei

ADD build/app.bin /project/app.bin
ADD build/node_modules /project/node_modules
ADD src/server/models/maya/effective/BestShape_s.png /project/src/server/models/maya/effective/BestShape_s.png
ADD build/public /project/public
ADD build/public_default /project/public_default
ADD build/public_ECK /project/public_ECK
#ADD build/assets.json /project/build/assets.json
ADD build/app/locales /project/app/locales

#work around phantomjs
COPY tools/phantomjs/dockerized-phantomjs.tar.gz /dockerized-phantomjs.tar.gz
RUN tar xzf /dockerized-phantomjs.tar.gz -C / && \
    rm -rf /project/node_modules/phantomjs-prebuilt
ADD node_modules/phantomjs /project/node_modules/phantomjs-prebuilt

WORKDIR /project

ENTRYPOINT ["./app.bin"]
