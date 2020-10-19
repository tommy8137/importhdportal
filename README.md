# BestShape v2.3
[![build status](https://gitlab.mrd3.openlab.tw/bestshape/HD-web-portal/badges/develop/build.svg)](https://gitlab.mrd3.openlab.tw/bestshape/HD-web-portal/commits/develop)
## Release production docker iamges
```
$ make clean
$ make build
$ make docker-build
$ make docker-push
```

> node v6.9.2

## Development Requirement
* node v6 (6.9.0 tested)
* UNIX-like OS is stable
* chrome >= v58

## Installation
```
$ yarn install
```

## Running development server
If it's the first time to start the development environment, some keys must be generated at first (you have to do these only one time):
```
$ yarn run generate-jwt-keys
$ yarn run generate-https-cert
$ yarn run generate-license-pwd
$ yarn run generate-license-key
$ yarn run maya-jwt-keys
$ yarn run update-license
```
start the dev-server:
```
$ yarn run dev
```
and then visit `https://localhost:3000` while all the tasks got done.
## Test code
### Test server code
api except related to license
```
$ yarn run test
```
license api
```
$ yarn run test-license
```
### Test client code
```
$ yarn run test-client
```
## Build
```
$ yarn run build
```
will build codes under ```./build```
## Configuration
Server is configured through environment variables, please refer to ```web-portal/config.js``` for the available settings
### development
If you want to make the change of configuration in the development environment, please modify the following block in ```web-portal/gulpfile.babel.js```:
```javascript=
const devServerEnv = {
  NODE_ENV: 'development',
  BABEL_ENV: 'development',
  port: process.env['port'] || '8008',
  radiusip: '210.200.13.224',
  radiusport: '10000',
  spip: '210.200.13.224',
  spport: '13000',
  pgip: '210.200.13.224',
  pgport: '15432',
  pgdb: 'wiprognosis',
  pgname: 'postgres',
  pgpw: 'wiprognosispassword',
  universal: false,
  asyncrendering: false,
}
```
## Universal rendering
### Main libraries to help us do universal rendering
* **react**
As the usual way, react is responsible for rendering the wanted component to string.
* **redux**
Application state are managed at both server and client. Furthurmore, server will pass the initial state of redux store to the browser via `window.__reduxState__`
* **react-router**
Routes are defined in `react-router` way. It helps us to get the correct component to be rendered.
* **redux-saga**
We use `redux-saga` to compose many asychronous tasks. The major purpose is for related fetching and authentication flow. Since the authetication flow is the token based architecture. With `redux-saga` composable tasks are elegant and maintable.

### Universal Fetching data
In my opinion, this is the most difficult when doing universal rendering. More precisely, the difficulty is to fetch secured data. References to the [server rendering guide](https://github.com/reactjs/react-router/blob/master/docs/guides/ServerRendering.md) of `react-router`:
> For data loading, you can use the renderProps argument to build whatever convention you want--like adding static load methods to your route components, or putting data loading functions on the routes--it's up to you.

and the solution by [asyc-props](https://github.com/ryanflorence/async-props), components which should should be fed data are assigned static property `preloader` with related `redux actions`(without dispatch bound, just pure action creators), server and browser will try to fetch data in slightly different ways but use the same action creators. This way allows these action creators reusable in some user interactions managed by components, and the truly ***universal***.
## Server
Refactored with [koa](https://github.com/koajs/koa)
### Authentication architecture
Will powered by [json web token](https://jwt.io/).

## React Hot Transform
Click buttons to add or subtract some numbers, and then modify the rendering content of component App.
It should persist the current state but react the latest rendering result

## Api Document
### Generate documents
```
$ gulp apidoc
```
### Monitor files changed when development:
```
$ gulp watch-apidoc
```
Visit `/apidoc/`
