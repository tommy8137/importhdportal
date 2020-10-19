import TestServer from 'fetch-test-server'
import app from 'server/server-preloader'

import jwt from 'jsonwebtoken'
const path = require('path')
const fs = require('fs')

const server = new TestServer(app.callback())

let accessToken

const authPrivateKey = fs.readFileSync(path.join(global.ROOT, 'keys/maya_auth_key_rsa'), { encoding: 'utf-8' })
const accessPrivateKey = fs.readFileSync(path.join(global.ROOT, 'keys/maya_access_key_rsa'), { encoding: 'utf-8' })

const getToken = (time) => {
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
  return jwt.sign(user, authPrivateKey, { expiresIn: `${time} ms`, algorithm: 'RS256' })
}

it('entry accessed with token-B & target', async () => {
  const authtoken = getToken(5*60*1000)
  const { accessToken: token } = await server
    .post('/api/maya/auth/access-token', {
      headers: { 'Content-Type': 'application/json' },
      body: { 'token': `${authtoken}` },
    })
    .then(res => res.json())

  let url = `/entry?token=${token}&target=%2Fpatient%2F05293201%2Fdashboard%2F8027DCC4AB8C727006379288C7938810`
  const res = await server.get(url, {
    headers: {
      'Content-Type': 'application/json',
    },
  })
  expect(res.status).toBe(200)
})

it('entry api accessed without params', async () => {
  let url = '/entry'
  const entryRes = await server.get(url, {
    headers: {
      'Content-Type': 'application/json',
    },
  })
  expect(entryRes.status).toBe(401)
})

it('entry api accessed with expired token', async () => {
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
  let expiredJWT = jwt.sign(user, accessPrivateKey, { expiresIn: `${1} ms`, algorithm: 'RS256' })

  let url = `/entry?token=${expiredJWT}&target=%2Fpatient%2F05293201%2Fdashboard%2F8027DCC4AB8C727006379288C7938810`

  const entryRes = await server.get(url, {
    headers: {
      'Content-Type': 'application/json',
    },
  })
  expect(entryRes.status).toBe(401)
})

it('entry api accessed with wrong token', async () => {
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
  let wrongToken = jwt.sign(user, 'secret', { expiresIn: 60*5 })

  let url = `/entry?token=${wrongToken}&target=%2Fpatient%2F05293201%2Fdashboard%2F8027DCC4AB8C727006379288C7938810`

  const entryRes = await server.get(url, {
    headers: {
      'Content-Type': 'application/json',
    },
  })
  expect(entryRes.status).toBe(401)
})

// it('entry api accessed with token-B but user-id not in the table', async () => {
//   const authtoken = getToken(5*60*1000)
//   const { accessToken: token } = await server
//     .post('/api/maya/auth/access-token', {
//       headers: { 'Content-Type': 'application/json' },
//       body: { 'token': `${authtoken}` },
//     })
//     .then(res => res.json())

//   const logoutRes = await server.post('/api/maya/auth/logout', {
//     headers: {
//       'Content-Type': 'application/json',
//       'Authorization': `Bearer ${token}`,
//     },
//   })
//   expect(logoutRes.status).toBe(200)

//   let url = `/entry?token=${token}&target=%2Fpatient%2F05293201%2Fdashboard%2F8027DCC4AB8C727006379288C7938810`

//   const entryRes = await server.get(url, {
//     headers: {
//       'Content-Type': 'application/json',
//     },
//   })
//   expect(entryRes.status).toBe(401)
// })
