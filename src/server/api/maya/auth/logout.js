import authHelper from 'server/helpers/server-auth-helper'
import { errorCode, throwApiError } from 'server/helpers/api-error-helper'
import { removeUser } from 'server/helpers/user-id-helper'
const { maya } = global.config

export default class Logout {

  *jwt(next) {
    const ctx = this
    const { request: req } = this

    let token = null
    const rule = /^[bB]earer\s(.+)$/
    if (!rule.test(req.get('Authorization'))) {
      throwApiError('Unauthorized', errorCode.UNAUTHORIZED)
    }

    token = rule.exec(req.get('Authorization'))[1]
    let decode = authHelper.jwtMayaVerify(token, maya.authPublicKey)

    if (decode.err) {
      ctx.type = 'application/json'
      throwApiError('Unauthorized', errorCode.UNAUTHORIZED)
    } else {
      if (!decode.id) {
        ctx.status = 400
        throwApiError('user id undefined', errorCode.ACCESS_DENY)
      } else if (!decode.loginTime){
        ctx.status = 400
        throwApiError('loginTime undefined', errorCode.ACCESS_DENY)
      }

      let result = yield removeUser(decode.id, decode.loginTime)
      if (!result) {
        ctx.type = 'application/json'
        throwApiError('Unauthorized', errorCode.UNAUTHORIZED)
      }
      ctx.type = 'application/json'
      ctx.body = JSON.stringify('log out successfully')
    }
  }
}
