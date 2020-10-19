import React from 'react'
import ReactDOM from 'react-dom/server'
import authHelper, { COOKIE_AUTH_TOKEN } from 'server/helpers/server-auth-helper'
import authenticator from './authenticator'
import fs from 'fs'
import koa from 'koa'
import passport from 'koa-passport'
import router from 'koa-router'
import PassportHelper from 'server/helpers/passport'
import renderToString from 'server/utils/render-page'
import requestId from 'koa-request-id'
import { errorCode, throwApiError } from 'server/helpers/api-error-helper'
import path from 'path'
import { initRedux } from 'server/utils/render-page/match-routes'
import hydrate from 'server/utils/render-html'
import { setAccessToken } from 'actions/universal-action'
import { getRefreshToken } from 'server/helpers/user-id-helper'
import Licenses from 'server/helpers/licenses'
import { nexeFs } from 'server/utils/nexe-fs'
import { nexePath } from 'common/nexe-path'

const assetsPath = nexePath.convert(path.join(__dirname, global.config.backgroundPic == 'ECK' ? '../../../build/assets_ECK.json' : '../../../build/assets_default.json'))
const assets = JSON.parse(nexeFs.readFileSync(assetsPath, 'utf-8'))
const loginUrl = '/login'
const frontend = new koa()

frontend.use(function* (next) {
  if (/^\/api/.test(this.path)) {
    yield next
  } else {
    if (global.config.universal) {
      yield composeMiddleware(this, next, requestId(), authenticate, responseStatus, initStore, universalRender, )
      // yield composeMiddleware(this, next, requestId(), authenticate, initStore, universalRender)
    } else {
      yield composeMiddleware(this, next, authenticate, responseStatus, initStore, nonUniversalRender)
      // yield composeMiddleware(this, next, authenticate, initStore, nonUniversalRender)
    }
    // yield composeMiddleware(this, next, authenticate, initStore)
  }
})

function composeMiddleware(ctx, next, ...middlewares) {
  let composed
  for (let i = middlewares.length - 1; i >= 0; i--) {
    if (!composed) {
      composed = middlewares[i].call(ctx, next)
    } else {
      composed = middlewares[i].call(ctx, composed)
    }
  }
  return composed
}

function* authenticate(next) {
  const ctx = this
  yield passport.authenticate('app', { session: false }, function* (err, user, info) {
    if (err) {
      this.throw(err)
      return
    }

    const { jti, ...rest } = user
    ctx.state.user = rest
    ctx.state.token = ctx.cookies.get(COOKIE_AUTH_TOKEN)
    yield next

    /*if (ctx.status == 401) {
      ctx.redirect('/unauthorized')
    } else if (ctx.status == 403) {
      ctx.redirect('/license-expired')
    } else {
      const { jti, ...rest } = user
      ctx.state.user = rest
      ctx.state.token = ctx.cookies.get(COOKIE_AUTH_TOKEN)
      yield next
    }*/
  }).call(this, next)
}

function* initStore(next) {
  const language = this.acceptsLanguages('en', 'zh-tw', 'zh-cn')
  let timeout = this.cookies.get('timeout')
  timeout = timeout? parseFloat(timeout) * 60 * 1000: null
  const licenseExpired = !Licenses.checkLicense()
  let refreshToken
  if (this.state.user) {
    refreshToken = yield getRefreshToken(this.state.user.id, this.state.user.loginTime)
  }
  this.state.requestState = {
    url: this.originalUrl,
    timeout,
    licenseExpired,
    user: this.state.user,
    token: this.state.token,
    agreements: this.cookies.get('agreements'),
    language,
    assets,
    refreshToken: refreshToken || null,
  }
  yield next
}

function* universalRender(next) {
  try {
    const result = yield renderToString(this.id, this.state.requestState)
    if (!result) {
      throw 'unexpected error occurs.'
    } else if (typeof result.redirectTo == 'string') {
      this.redirect(result.redirectTo)
      return
    } else if (result.body) {
      // koa default's status will be 404
      this.status = result.status || (this.status != 404 && this.status) || 200
      this.body = result.body
    } else if (result.status == 500) {
      throwApiError(result.message || 'internal server error.', result.code || 9517)
    } else {
      throwApiError('unexpected error occurs.')
    }
  } catch (ex) {
    if (ex.status == 401) {
      this.redirect(`/unauthorized`)
    } else if (ex.status == 403) {
      this.redirect(`/license-expired`)
    } else { // unknown error occurs
      this.body = ex.message
      this.status = 500
      // throwApiError(ex.message)
      // this.throw(ex, ex.status || 500)
    }
  }
}

function *nonUniversalRender(next) {
  const { history, store } = initRedux(this.state.requestState)
  store.dispatch(setAccessToken(null))
  this.body = hydrate(assets, null, store)
}

function* responseStatus(next) {
  // this.status = null
  if (/^\/unauthorized/i.test(this.path)) {
    this.status = 401
  } else if (/^\/license-expired/i.test(this.path)) {
    this.status = 403
  }
  yield next
}

export default frontend
