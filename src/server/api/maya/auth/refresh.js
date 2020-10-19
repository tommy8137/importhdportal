import authHelper, { COOKIE_AUTH_TOKEN, TOKEN_EXPIERED_ERROR, TTL } from 'server/helpers/server-auth-helper'
import apiErrorHelper from 'server/helpers/api-error-helper'
import Licenses from 'server/helpers/licenses'
import { refreshUser } from 'server/helpers/user-id-helper'

export default class Refresh {

  //TODO this func name is bad, must figure out a name like facebook, github, google etc.
  *jwt() {
    const ctx = this
    const { request: req } = this
    if (!req.body.refreshToken) {
      //TODO should throw err here
      ctx.status = 400
      ctx.body = 'refresh token should be provided'
      return
    }
    const isValid = authHelper.verifyRefreshToken(ctx.req.user.jti, req.body.refreshToken)
    if (isValid !== true) {
      //TODO should throw err here
      ctx.status = 401
      ctx.body = 'the refresh token is invalid, please re-login'
      return
    }
    yield refreshUser(ctx.req.user.id, ctx.req.user.loginTime)
    const { accessToken, refreshToken } = yield authHelper.jwtSign(ctx.req.user, TTL)
    ctx.cookies.set(COOKIE_AUTH_TOKEN, accessToken, { signed: false })
    ctx.body = { refreshToken: refreshToken, accessToken: accessToken }
  }
}
