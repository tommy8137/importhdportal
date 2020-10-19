import app from 'server/server-preloader'
import Protos from 'common/protos'
import co from 'co'
import fs from 'fs'
import Licenses from 'server/helpers/licenses'
import { validLicenseInfo } from 'server/helpers/licenses/license-entries'

const { keyPath, licenseFilePath } = global.config
const TestServer = global.TestServer
const mayaAuth = global.mayaAuth
const { About: proto, Licenses: licensesProto } = Protos
const server = new TestServer(app.callback())
const url = '/api/maya/admins/about'
const putUrl = '/api/maya/admins/about/licenses'
// const licenseKey = { license_key: crypt.encrypt('{ "start_date": "2011-05-26T07:56:00.123Z", "end_date": "2021-05-26T07:56:00.123Z", "version": "vvv"}') }
let accessToken
let drToken

const options = token => ({
  headers: {
    'Content-Type': 'application/octet-stream',
    'Authorization': `Bearer ${token}`,
  },
})

beforeAll(async () => {
  accessToken = await mayaAuth(server)('admin')
  drToken = await mayaAuth(server)('dr')
})

it('[license] put about licenses api should be updated successfully', async () => {
    const license_key = Licenses.encrypt(JSON.stringify(validLicenseInfo))
    const postBody = { license_key }
    const res = await server
      .put(putUrl, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(postBody),
      })
    expect(res.status).toBe(200)
  }
)

it('[license] admin should be able to access about api', async () => {
  const res  = await server.get(url, options(accessToken))
  expect(res.status).toBe(200)
})

it('[license] doctor should be able to access about api', async () => {
  const res  = await server.get(url, options(drToken))
  expect(res.status).toBe(401)
})

it('[license] about api should response correct message', async () => {
  const data = await server
    .get(url, options(accessToken))
    .then(proto.response.transform)

  const About = require('server/models/maya/admins/about')
  const expected = await About.getAbout()
  expect(data).toEqual(expected)
})

it('[license] about api should response not modify if there is correct E-tag', async () => {
  const getAboutRes = await server.get(url, options(accessToken))
  const etag = await getAboutRes.headers._headers.etag[0]
  const res = await server
    .get(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'If-None-Match': etag
      }
    })
  expect(res.status).toBe(304)
})

it('[license] about api should response HTTP method wrong if using POST method', async () => {
  const res = await server.post(url, options(accessToken))
  expect(res.status).toBe(405)
})

it('[license] put about wrong licenses api should response 400',
  async () => {
    const postBody = JSON.stringify({ license: { duration: 60 } })
    const res = await server
      .put(putUrl, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: postBody,
      })
    expect(res.status).toBe(400)
  }
)

it('[license] put about licenses api should response 400 if body null', async () => {
  const res = await server.put(putUrl, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    }
  })
  expect(res.status).toBe(400)
})

it('[license] put about api should response HTTP method wrong if using POST method', async () => {
  const res = await server.post(putUrl, options(accessToken))
  expect(res.status).toBe(405)
})

it('[license] put about licenses api should response 415 if Content-Type header is not application/json', async () => {
  const res = await server
    .put(putUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      }
    })
  expect(res.status).toBe(415)
})
