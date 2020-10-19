import jwt from 'jsonwebtoken'
import authHelper, { TTL } from 'server/helpers/server-auth-helper'
import { errorCode, throwApiError } from 'server/helpers/api-error-helper'
import { findUser } from 'server/helpers/user-id-helper'
const { maya } = global.config

const path = require('path')
const fs = require('fs')

const authPrivateKey = fs.readFileSync(path.join(global.ROOT, '/keys/maya_auth_key_rsa'), { encoding: 'utf-8' })

const url = '/api/maya/auth/access-token'
const options = (token) => ({
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ token }),
})

const getToken = (time, scope) => {
  let user = {
    'id':'mis-ip + mis-id',
    'loginTime': '20170117',
    'name':'mis',
    'displayName':'mis',
    'position':'mis position',
    'phone':'124',
    'email':'123@gm',
    'scope': scope,
  }
  return jwt.sign(user, authPrivateKey, { expiresIn: `${time} ms`, algorithm: 'RS256' })
}

const Maya =  (testServer) => async (scope)  => {
  const tokenM = getToken(TTL, scope)
  const { accessToken: token } = await testServer.post(url, options(tokenM)).then(res =>  res.json())
  const accessToken = await redirectToken(token)
  return accessToken
}

async function redirectToken(token) {

  let decode = authHelper.jwtMayaVerify(token, maya.accessPublicKey)
  if (decode.err) {
    throwApiError('Unauthorized', errorCode.UNAUTHORIZED)
  }

  // if (!maya.develop) {
  //   let result = await findUser(`${decode.loginTime}+${decode.id}`)
  //   if (!result) {
  //     throwApiError('Unauthorized', errorCode.UNAUTHORIZED)
  //   }
  // }
  const { accessToken } = authHelper.jwtSign(decode, TTL)
  return accessToken
}

export default Maya
