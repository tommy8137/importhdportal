import TestServer from 'fetch-test-server'
import app from 'server/server-preloader'
import jwt from 'jsonwebtoken'
const path = require('path')
const fs = require('fs')
const server = new TestServer(app.callback())
const url = `/api/maya/auth/logout`

const authPrivateKey = fs.readFileSync(path.join(global.ROOT, 'keys/maya_auth_key_rsa'), { encoding: 'utf-8' })

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
  return jwt.sign(user, authPrivateKey, { expiresIn: time,  algorithm: 'RS256' })
}

it('logout api accessed with token-M', async () => {
  let authToken = getToken(5*60*1000, user)
  const authRes = await server.post(`/api/maya/auth/access-token`, {
    headers: { 'Content-Type': 'application/json' },
    body: { 'token': `${authToken}` },
  })

  const res = await server.post(url, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`,
    },
  })
  expect(res.status).toBe(200)
})


it('logout api accessed with token-M but RecordID table without this id', async () => {
  let authToken = getToken(5*60*1000, user)
  const res = await server.post(url, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`,
    },
  })
  expect(res.status).toBe(401)
})

it('logout api token without user id', async () => {
  let usernoID = {
    'loginTime': '20170110173751',
    'name':'mis',
    'displayName':'mis',
    'position':'mis position',
    'phone':'124',
    'email':'123@gm',
    'scope': 'admin',
  }
  let authToken = getToken(5*60*1000, user)
  const authRes = await server.post(`/api/maya/auth/access-token`, {
    headers: { 'Content-Type': 'application/json' },
    body: { 'token': `${authToken}` },
  })

  let errorToken = getToken(5*60*1000, usernoID)
  const res = await server.post(url, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${errorToken}`,
    },
  })
  expect(res.status).toBe(400)
})

it('logout api token without loginTime', async () => {
  let usernoTime = {
    'loginTime': '20170110173751',
    'name':'mis',
    'displayName':'mis',
    'position':'mis position',
    'phone':'124',
    'email':'123@gm',
    'scope': 'admin',
  }
  let authToken = getToken(5*60*1000, user)
  const authRes = await server.post(`/api/maya/auth/access-token`, {
    headers: { 'Content-Type': 'application/json' },
    body: { 'token': `${authToken}` },
  })

  let errorToken = getToken(5*60*1000, usernoTime)
  const res = await server.post(url, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${errorToken}`,
    },
  })
  expect(res.status).toBe(400)
})


it('logout api accessed with expired token-M', async () => {
  const authToken = getToken(5*60*1000, user)
  const authRes = await server.post(`/api/maya/auth/access-token`, {
    headers: { 'Content-Type': 'application/json' },
    body: { 'token': `${authToken}` },
  })

  const expiredToken = getToken(1, user)
  const delay = (ms) => new Promise(resolve => setTimeout(() => resolve(true), ms))
  await delay(2000)
  const res = await server.post(url, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${expiredToken}`,
    },
  })
  expect(res.status).toBe(401)
})

it('logout api accessed without Authorization', async () => {
  let authToken = getToken(5*60*1000, user)
  const authRes = await server.post(`/api/maya/auth/access-token`, {
    headers: { 'Content-Type': 'application/json' },
    body: { 'token': `${authToken}` },
  })

  const res = await server.post(url, { headers: { 'Content-Type': 'application/json' } })
  expect(res.status).toBe(401)
})
