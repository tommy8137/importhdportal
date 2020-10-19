import app from 'server/server-preloader'
// import TestServer from 'fetch-test-server'
import Protos from 'common/protos'
import co from 'co'
import Risks from 'server/models/maya/risks/risks'
const { Libs } = Protos
const TestServer = global.TestServer
const mayaAuth = global.mayaAuth
const server = new TestServer(app.callback())
const url = '/api/maya/risks/libs'

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
  drToken = await mayaAuth(server)('doctor')
})

it('admin should be able to access libs api', async () => {
  const res  = await server.get(url, options(accessToken))
  expect(res.status).toBe(200)
})

it('doctor should be able to access libs api', async () => {
  // const loginUrl = '/api/maya/auth/login'
  // const loginResponse = await server.post(loginUrl, {
  //   headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  //   body: 'username=dr&password=drpw',
  // })

  // expect(loginResponse.status).toBe(200)
  // const { accessToken: drToken } = await loginResponse.json()
  // expect(drToken).toBeTruthy()
  const res = await server.get(url, options(drToken))
  expect(res.status).toBe(200)
})

it('libs api should response correct message', co.wrap(function * () {
  const data = yield server
    .get(url, options(accessToken))
    .then(Libs.response.transform)

  const lang = 'en_US'
  const expected = yield Risks.getLibs(lang)
  const encodeExpected = Protos.Libs.response.encode(expected).toBuffer()
  const DecodedExpected = Protos.Libs.response.decode(encodeExpected)
  expect(data).toEqual(DecodedExpected)
}))

it('libs api should response not modify if there is correct E-tag', async () => {
  const getLibsRes = await server.get(url, options(accessToken))
  const etag = await getLibsRes.headers._headers.etag[0]
  const res = await server
    .get(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'If-None-Match': etag
      }
    })

  expect(res.status).toBe(304)
})

it('libs api should response HTTP method wrong if using POST method', async () => {
  const res = await server.post(url, options(accessToken))
  expect(res.status).toBe(405)
})
