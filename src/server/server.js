import path from 'path'
import koa from 'koa'
import logger from 'koa-logger'
import bodyParser from 'koa-bodyparser'
import helmet from 'koa-helmet'
import mount from 'koa-mount'
import serve from 'koa-static'
import apiRouter from './api/index'
import Entry from './middlewares/entry'
import errorHandler from './middlewares/error-handler'
import morganLogger from './middlewares/logger'
import frontendRouter from './middlewares/router-middleware'
import co from 'co'
import timeout from 'koa-timeout'
import router from 'koa-router'
import passport from 'koa-passport'
import conditional from 'koa-conditional-get'
import etag from 'koa-etag'
import PassportHelper from './helpers/passport'
import { methodNotAllowedOptions, errorCode, throwApiError } from './helpers/api-error-helper'
import cors from 'koa-cors'
import { nexePath } from 'common/nexe-path'
import { backgroundPic } from '../config'
// initial server setting

const app = koa()
app.use(cors({ origin: '*' }))
app.use(logger())
// error handling asap
app.use(errorHandler)
// conditional get
app.use(conditional())
// add etag
app.use(etag())
app.use(timeout(1000 * 60))
app.use(morganLogger)
app.use(bodyParser({
  onerror: (err, ctx) => throwApiError('body parse error', errorCode.UNPROCESSABLE)
}))
app.use(helmet({
  frameguard: { action: 'deny' },
  noCache: true,
  xssFilter: { setOnOldIE: true },
}))


// passport setting
passport.use('login', PassportHelper.loginStrategy)
passport.use('app', PassportHelper.appStrategy)
passport.use('api', PassportHelper.apiStrategy)

app.use(passport.initialize())

const apidoc = koa()
const statics = koa()
const apiPath = nexePath.convert(path.join(__dirname, '../..', 'apidoc'))

let staticsPath = null
if(backgroundPic == 'ECK') {
  staticsPath = nexePath.convert(path.join(__dirname, '../..', 'build/public_ECK'))
} else {
  staticsPath = nexePath.convert(path.join(__dirname, '../..', 'build/public_default'))
}

apidoc.use(serve(apiPath))
statics.use(serve(staticsPath))


app.use(mount('/static', statics))

const appRouter = new router()
appRouter.use('/api', apiRouter.routes())
const entry = new Entry()
appRouter.get('/entry', entry.jwt)
app.use(appRouter.routes())
app.use(appRouter.allowedMethods(methodNotAllowedOptions))
// mainly rendering
app.use(mount('/', frontendRouter))

if (global.__DEV__) {
  app.use(mount('/apidoc', apidoc))
}

export default app
