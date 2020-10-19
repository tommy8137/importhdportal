import AccessToken from 'server/api/maya/auth/access-token.js'
import co from 'co'
import jwt from 'jsonwebtoken'
const path = require('path')
const fs = require('fs')

describe('[unit] Access-token api & test jwt function', function() {
  let parameters = this
  const accessTokenFunc = new AccessToken()
  let user = {
    'name':'mis',
    'displayName':'mis',
    'position':'mis position',
    'phone':'124',
    'email':'123@gm',
  }
  const authPrivateKey = fs.readFileSync(path.join(global.ROOT, 'keys/maya_auth_key_rsa'), { encoding: 'utf-8' })
  const getToken = (user) => {
    return jwt.sign(user, authPrivateKey, { expiresIn: 5 * 60 * 1000, algorithm: 'RS256' })
  }

  it('request body have wrong token, so it should be return "Invalid token"', async () => {
    let tempParamet = {
      ...parameters,
      'request':{
        'body': {
          'token': '123',
        },
      },
    }
    try {
      await co(accessTokenFunc.jwt.apply(tempParamet))
      expect(true).toEqual(false)
    } catch (err) {
      expect(err.message).toEqual('Invalid token')
    }
  })

  it('token without user id, so it should be return "user id undefined"', async () => {
    let tempParamet = {
      ...parameters,
      'request':{
        'body': {
          'token': getToken(user),
        },
      },
    }
    try {
      await co(accessTokenFunc.jwt.apply(tempParamet))
      expect(true).toEqual(false)
    } catch (err) {
      expect(err.message).toEqual('user id undefined')
    }
  })

  it('token without loginTime, so it should be return "loginTime undefined"', async () => {
    let tempParamet = {
      ...parameters,
      'request':{
        'body': {
          'token': getToken({
            ...user,
            'id': 'mis-id123',
          }),
        },
      },
    }
    try {
      await co(accessTokenFunc.jwt.apply(tempParamet))
    } catch (err) {
      expect(err.message).toEqual('loginTime undefined')
    }
  })

  it('token object scope is null , so it should be set scope "doctor"', async () => {
    let tempParamet = {
      ...parameters,
      'request':{
        'body': {
          'token': getToken({
            ...user,
            'id': 'mis-id123',
            'loginTime': '20170110173751',
            'scope': '',
          }),
        },
      },
    }
    co(accessTokenFunc.jwt.apply(tempParamet))
  })

  it('token is right, retrun accessToken', async () => {
    let tempParamet = {
      ...parameters,
      'request':{
        'body': {
          'token': getToken({
            ...user,
            'id': 'mis-id123',
            'loginTime': '20170110173751',
            'scope': 'doctor',
          }),
        },
      },
    }
    await co(accessTokenFunc.jwt.apply(tempParamet))
    expect(tempParamet.body.accessToken).toBeTruthy()
  })
})
