import authHelper, { COOKIE_AUTH_TOKEN, TTL } from 'server/helpers/server-auth-helper'
import { errorCode, throwApiError } from 'server/helpers/api-error-helper'
import { findUser, recordRefreshToken } from 'server/helpers/user-id-helper'
import Agree from 'server/models/maya/users/agreements'
import Protos from 'common/protos'
import R from 'ramda'

const { maya } = global.config

const verifyTarget = R.cond([
  [target => target === '/', R.T],
  [target => /^\/patient\//i.test(target), R.T],
  [R.T, R.F],
])

export default class Entry {

  *jwt(next) {
    const ctx = this
    const { request: req } = this
    if (!req.query.token) {
      this.redirect('/unauthorized')
      return
    }

    if (!verifyTarget(req.query.target)) {
      ctx.status = 400
      return
    }

    let decode = authHelper.jwtMayaVerify(req.query.token, maya.accessPublicKey)

    if (decode.err) {
      this.redirect('/unauthorized')
      return
    }

    if (!maya.develop) {
      let result = yield findUser(decode.id, decode.loginTime)
      if (!result) {
        this.redirect('/unauthorized')
        return
      }
    }

    const agreements = yield Agree.getAgreements(decode.id)
    ctx.cookies.set('agreements', agreements.always_show, { signed: false })

    const { accessToken, refreshToken } = authHelper.jwtSign(decode, TTL)
    yield recordRefreshToken(decode.id, decode.loginTime, refreshToken)

    ctx.cookies.set(COOKIE_AUTH_TOKEN, accessToken, { signed: false })
    ctx.status = 302
    ctx.body = `Access resource successfully. Redirect to ${req.query.target}`
    ctx.redirect(req.query.target)
  }
}
