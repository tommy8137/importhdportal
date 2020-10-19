import authHelper, { COOKIE_AUTH_TOKEN, TTL } from 'server/helpers/server-auth-helper'
import fetch from 'isomorphic-fetch'
import passport from 'koa-passport'
import { errorCode, throwApiError } from 'server/helpers/api-error-helper'
import Licenses from 'server/helpers/licenses/'

const { secret, recaptchaSecret } = global.config

export default class Login {

  //TODO this func name is bad, must figure out a name like facebook, github, google etc.
  *jwt(next) {
    this.models = this.models || passport
    const ctx = this
    yield this.models.authenticate('login',  function* (err, user, info) {
      //TODO should throw a unified err
      if (err) {
        throw err
      }
      if (user === false) {
        ctx.cookies.set(COOKIE_AUTH_TOKEN, null)
        throwApiError('Account or Password is not correct', errorCode.AUTH_WRONG)
      } else {
        const { accessToken, refreshToken } = authHelper.jwtSign(user, TTL)
        ctx.cookies.set(COOKIE_AUTH_TOKEN, accessToken, { signed: false }) //, expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 8)
        ctx.body = { accessToken, refreshToken, expiresIn: Date.now().valueOf() + TTL, user }
      }
    }).call(this, next)
  }
}
