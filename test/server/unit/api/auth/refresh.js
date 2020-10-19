import Refresh from 'server/api/maya/auth/refresh.js'
import { recordUser } from 'server/helpers/user-id-helper'
import co from 'co'
import uuid from 'node-uuid'
import jwt from 'jsonwebtoken'
import authHelper  from 'server/helpers/server-auth-helper'
const refreshTokenKey = `1G8G=9.kXUD!P89J:5C35iF6dLE8~5""6a0EKP2sMq7M0|9GRZ6y{7'El/eViUy`

describe('[unit] refresh api & test jwt function', function() {
  let parameters = this
  const refreshFunc = new Refresh()
  it('request body have not refresh token, so it should be return "refresh token should be provided"', async () => {
    let tempParamet = {
      ...parameters,
      'request':{
        'body': {
          'refreshToken': '',
        },
      },
    }
    co(refreshFunc.jwt.apply(tempParamet)).then(() => {
      expect('refresh token should be provided').toEqual(tempParamet.body)
    })
  })

  it('refresh token is not valid, so it should be return "the refresh token is invalid, please re-login"', async () => {
    let tempParamet = {
      ...parameters,
      'request':{
        'body': {
          'refreshToken': 'error-refresh-token',
        },
      },
      'req': {
        'user': {
          'loginTime': '20170110173751',
          'jti': uuid.v4(),
        },
      },
    }
    co(refreshFunc.jwt.apply(tempParamet)).then(() => {
      expect('the refresh token is invalid, please re-login').toEqual(tempParamet.body)
    })
  })

  it('refresh token is not valid, so it should be return "the refresh token is invalid, please re-login"', async () => {
    let tempParamet = {
      ...parameters,
      'request':{
        'body': {
          'refreshToken': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE0OTYxOTY1NzUsImV4cCI6MTQ5NjgwMTM3NX0.nBJFRa2bfEvfeqd65G6uT-VFbFhNIVF-nADz52c6GUw',
        },
      },
      'req': {
        'user': {
          'loginTime': '20170110173751',
          'jti': uuid.v4(),
        },
      },
    }
    co(recordUser('mis-id123', '20170110173751'))
    await co(refreshFunc.jwt.apply(tempParamet))
    expect('the refresh token is invalid, please re-login').toEqual(tempParamet.body)
  })

  it('refresh token is valid, so it should be return "the refresh token is invalid,please re-login"', async () => {
    const userID = 'mis-id123'
    let user = {
      'id': userID,
      'loginTime': '20170110173751',
      'name':'mis',
      'displayName':'mis',
      'position':'mis position',
      'phone':'124',
      'email':'123@gm',
      'scope': 'admin',
    }
    const jti = uuid.v4()
    const refreshToken = genRefreshToken(user, jti)
    let tempParamet = {
      ...parameters,
      request:{
        body: {
          refreshToken,
        },
      },
      req: {
        user: {
          loginTime: '20170110173751',
          jti,
        },
      },
      cookies: {
        set:()=>{},
      },
    }
    co(recordUser(userID, '20170110173751'))
    await co(refreshFunc.jwt.apply(tempParamet))
    expect(tempParamet.body).toHaveProperty('accessToken')
    expect(tempParamet.body).toHaveProperty('refreshToken')
  })
})

function genRefreshToken(user, jti) {
  const jwtObject = {
    ...user,
    jti,
  }
  return jwt.sign({}, authHelper.prefixRefresTokenKey(jwtObject.jti) + refreshTokenKey, { expiresIn: `${7 * 24 * 60 * 60 * 1000} ms`, algorithm: 'HS256' })
}
