import Logout from 'server/api/maya/auth/logout.js'
import { recordUser } from 'server/helpers/user-id-helper'
import co from 'co'
import jwt from 'jsonwebtoken'
const path = require('path')
const fs = require('fs')

const authPrivateKey = fs.readFileSync(path.join(global.ROOT, 'keys/maya_auth_key_rsa'), { encoding: 'utf-8' })

let user = {
  'name':'mis',
  'displayName':'mis',
  'position':'mis position',
  'phone':'124',
  'email':'123@gm',
}
const getToken = (user) => {
  return jwt.sign(user, authPrivateKey, { expiresIn: 5 * 60 * 1000,  algorithm: 'RS256' })
}

describe('[unit] logout api & test jwt function', function() {
  let parameters = this
  const logoutFunc = new Logout()

  it('request body have not token, it should be return "Unauthorized"', async () => {
    let tempParamet = {
      ...parameters,
      'request':{
        'body': {
          'Authorization': '',
        },
        'get': function(){
          if(this.body.Authorization) {
            return this.body.Authorization
          } else {
            return false
          }
        },
      },
    }
    try {
      await co(logoutFunc.jwt.apply(tempParamet))
      expect(true).toEqual(false)
    } catch (err) {
      expect(err.message).toEqual('Unauthorized')
    }
  })

  it('request body have not right token, it should be return "Unauthorized"', async () => {
    let tempParamet = {
      ...parameters,
      'request':{
        'body': {
          'Authorization': 'bearer token',
        },
        'get': function(){
          if(this.body.Authorization) {
            return this.body.Authorization
          } else {
            return false
          }
        },
      },
    }
    try {
      await co(logoutFunc.jwt.apply(tempParamet))
      expect(true).toEqual(false)
    } catch (err) {
      expect(err.message).toEqual('Unauthorized')
    }
  })

  it('token without user id, so it should be return "user id undefined"', async () => {
    let tempParamet = {
      ...parameters,
      'request':{
        'body': {
          'Authorization': 'bearer ' + getToken(user),
        },
        'get': function(){
          if(this.body.Authorization) {
            return this.body.Authorization
          } else {
            return false
          }
        },
      },
    }
    try {
      await co(logoutFunc.jwt.apply(tempParamet))
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
          'Authorization': 'bearer ' + getToken({
            ...user,
            'id': 'mis-id123',
          }),
        },
        'get': function(){
          if(this.body.Authorization) {
            return this.body.Authorization
          } else {
            return false
          }
        },
      },
    }
    try {
      await co(logoutFunc.jwt.apply(tempParamet))
      expect(true).toEqual(false)
    } catch (err) {
      expect(err.message).toEqual('loginTime undefined')
    }
  })

  it('user not exist user list, so it should be return "Unauthorized"', async () => {
    let tempParamet = {
      ...parameters,
      'request':{
        'body': {
          'Authorization': 'bearer ' + getToken({
            ...user,
            'id': 'mis-id123',
            'loginTime': '20170110173751',
            'scope': 'doctor',
          }),
        },
        'get': function(){
          if(this.body.Authorization) {
            return this.body.Authorization
          } else {
            return false
          }
        },
      },
    }
    try {
      await co(logoutFunc.jwt.apply(tempParamet))
      expect(true).toEqual(false)
    } catch (err) {
      expect(err.message).toEqual('Unauthorized')
    }
  })

  it('logout success, so it should be return log out successfully', async () => {
    let tempParamet = {
      ...parameters,
      'request':{
        'body': {
          'Authorization': 'bearer ' + getToken({
            ...user,
            'id': 'mis-id123',
            'loginTime': '20170110173751',
            'scope': 'doctor',
          }),
        },
        'get': function(){
          if(this.body.Authorization) {
            return this.body.Authorization
          } else {
            return false
          }
        },
      },
    }
    co(recordUser('mis-id123', '20170110173751'))
    await co(logoutFunc.jwt.apply(tempParamet))
    expect('log out successfully').toEqual(JSON.parse(tempParamet.body))
  })
})
