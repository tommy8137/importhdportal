import TestServer from 'fetch-test-server'
import app from 'server/server-preloader'

import jwt from 'jsonwebtoken'
const path = require('path')
const fs = require('fs')

const authPrivateKey = fs.readFileSync(path.join(global.ROOT, 'keys/maya_auth_key_rsa'), { encoding: 'utf-8' })

const server = new TestServer(app.callback())
const url = `/api/maya/auth/access-token`
const options = (token) => ({
  headers: {
    'Content-Type': 'application/json',
  },
  body: {
    'token': `${token}`,
  },
})
let user = {
  'id': 'mis-id123',
  'loginTime': '20170110173751',
  'name':'mis',
  'displayName':'mis',
  'position':'mis position',
  'phone':'124',
  'email':'123@gm',
  'scope': 'admin',
}
const getToken = (time, user) => {
  return jwt.sign(user, authPrivateKey, { expiresIn: time, algorithm: 'RS256' })
}

it('auth api should be accessed with token-M', async () => {
  let TTL = 5 * 60 * 1000
  const res = await server.post(url, options(getToken(TTL, user)))
  expect(res.status).toBe(200)
})

it('auth api token without user id', async () => {
  let TTL = 5 * 60 * 1000
  let usernoID = {
    'loginTime': '20170110173751',
    'name':'mis',
    'displayName':'mis',
    'position':'mis position',
    'phone':'124',
    'email':'123@gm',
    'scope': 'admin',
  }
  const res = await server.post(url, options(getToken(TTL, usernoID)))
  expect(res.status).toBe(400)
})

it('auth api token with loginTime', async () => {
  let TTL = 5 * 60 * 1000
  let usernoTime = {
    'loginTime': '20170110173751',
    'name':'mis',
    'displayName':'mis',
    'position':'mis position',
    'phone':'124',
    'email':'123@gm',
    'scope': 'admin',
  }
  const res = await server.post(url, options(getToken(TTL, usernoTime)))
  expect(res.status).toBe(400)
})

it('auth api should return 400 with expired token', async () => {
  const TTL = 1
  const token = getToken(TTL, user)
  const delay = (ms) => new Promise((resolve) => {
    setTimeout(() => resolve(true), ms)
  })
  await delay(2000)
  const res = await server.post(url, options(token))
  expect(res.status).toBe(400)
})
