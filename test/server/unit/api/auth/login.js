import Login from 'server/api/maya/auth/login.js'
import co from 'co'
import fs from 'fs'
import path from 'path'
import uuid from 'node-uuid'
import jwt from 'jsonwebtoken'
import passport from 'koa-passport'

const privateKey = fs.readFileSync(path.join(global.ROOT, 'keys/key_rsa'), { encoding: 'utf-8' })

describe('[unit] login api & test jwt function', function() {
  let parameters = this
  parameters = {
    ...parameters,
    'cookies':{
      'set': function(){},
    }
  }
  const loginFunc = new Login()
  const userID = 'mis-id123'
  const user = {
    'id': userID,
    'loginTime': '20170110173751',
    'name':'mis',
    'displayName':'mis',
    'position':'mis position',
    'phone':'124',
    'email':'123@gm',
    'scope': 'admin',
  }
  const TTL = `${5 * 60 * 1000}`

  it('passport.authenticate error.., it should catch error', async () => {

    const accessToken = genAccessToken(user ,TTL)
    const expectError = new Error('error')
    let tempParamet = {
      ...parameters,
      request:{
        body: {
          accessToken
        },
      },
      models : {
        authenticate: function (stratexgy, jwtCallback) {
          return function* call(){
            yield jwtCallback(expectError, null, null)
          }
        }
      }
    }
    try {
      await co(loginFunc.jwt.apply(tempParamet))
      expect(false).toEqual(true)
    } catch(e) {
      expect(e).toEqual(expectError)
    }
  })
  //-----------------------------------------------------------------------------
  it('passport.authenticate not found user.., it should catch with \"Account or Password is not correct\"', async () => {

    const accessToken = genAccessToken(user ,TTL)
    const expectError = new Error('Account or Password is not correct')
    let tempParamet = {
      ...parameters,
      request:{
        body: {
          accessToken
        },
      },
      models : {
        authenticate: function (stratexgy, jwtCallback) {
          return function* call(){
            yield jwtCallback(null, false, null)
          }
        }
      }
    }
    try {
      await co(loginFunc.jwt.apply(tempParamet))
      expect(false).toEqual(true)
    } catch(e) {
      expect(e).toEqual(expectError)
    }
  })

  //-----------------------------------------------------------------------------
  it('passport.authenticate done.., it should return { accessToken, refreshToken, expiresIn, user}', async () => {

    const accessToken = genAccessToken(user ,TTL)
    const expectError = new Error('Account or Password is not correct')
    let tempParamet = {
      ...parameters,
      request:{
        body: {
          accessToken
        },
      },
      models : {
        authenticate: function (stratexgy, jwtCallback) {
          return function* call(){
            yield jwtCallback(null, user, null)
          }
        }
      }
    }
    await co(loginFunc.jwt.apply(tempParamet))
    expect(tempParamet.body).toHaveProperty('accessToken')
    expect(tempParamet.body).toHaveProperty('expiresIn')
    expect(tempParamet.body.user).toEqual(user)
    expect(tempParamet.body).toHaveProperty('refreshToken')
  })

  //-----------------------------------------------------------------------------
  it('should import passport.authenticate models when this.modules does not exist.', async () => {

    const accessToken = genAccessToken(user ,TTL)
    let tempParamet = {
      ...parameters,
      request:{
        body: {
          accessToken
        },
      }
    }
    co(loginFunc.jwt.apply(tempParamet)).then( successHandler, errorHnadler)
  })
})

  function genAccessToken(user, ttlMS) {
  const jwtObject = {
    ...user,
    jti: uuid.v4(),
  }
  return jwt.sign(jwtObject, privateKey, { expiresIn: `${ttlMS} ms`, algorithm: 'RS256' })
}

const successHandler = function() {

}
const errorHnadler = function(err) {
  // console.warn(err)
}
