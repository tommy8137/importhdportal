FROM mhart/alpine-node:4
#FROM alpine

ENV NODE_ENV production
ENV APP_HOME /universal-webserver

WORKDIR ${APP_HOME}

ADD package.json /tmp/package.json
RUN cd /tmp && npm install --production && npm install pm2 -g && rm -rf ~/.npm

RUN mkdir -p $APP_HOME && mv /tmp/node_modules $APP_HOME

ADD . $APP_HOME

#RUN npm install
CMD ["npm", "run", "start-server"]
#CMD ["pm2", "start", "./docker/npm-start.sh", "--name=\"universal-web-server\""]
