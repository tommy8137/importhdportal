import authHelper from 'server/helpers/server-auth-helper'
import { errorCode, throwApiError } from 'server/helpers/api-error-helper'
import { recordUser } from 'server/helpers/user-id-helper'
const { maya } = global.config

export default class Auth {

  *jwt(next) {
    const ctx = this
    const { request: req } = this
    let token = req.body.token
    let decode = authHelper.jwtMayaVerify(token, maya.authPublicKey)

    if (decode.err) {
      ctx.status = 400
      throwApiError('Invalid token', errorCode.ACCESS_DENY)
    } else {
      if (!decode.id) {
        ctx.status = 400
        throwApiError('user id undefined', errorCode.ACCESS_DENY)
      } else if (!decode.loginTime){
        ctx.status = 400
        throwApiError('loginTime undefined', errorCode.ACCESS_DENY)
      }

      if (decode.scope == '') {
        decode.scope = 'doctor'
      }

      yield recordUser(decode.id, decode.loginTime)
      const { accessToken } = authHelper.jwtMayaSign(decode, 5 * 60 * 1000)
      ctx.body = { accessToken }
    }
  }
}
