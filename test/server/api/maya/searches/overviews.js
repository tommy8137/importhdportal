import app from 'server/server-preloader'
import Protos from 'common/protos'
import co from 'co'
import Overviews from 'server/models/maya/searches/overviews'

const { Overview, OverviewAbnormal } = Protos
const TestServer = global.TestServer
const mayaAuth = global.mayaAuth
const server = new TestServer(app.callback())
const url = '/api/maya/searches/overviews/all'
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

it('admin should be able to access overviews api', async () => {
  const res = await server.get(`${url}?hemarea=all`, options(accessToken))
  expect(res.status).toBe(200)
})

it('doctor should be able to access overviews api', async () => {
  // const loginUrl = '/api/maya/auth/login'
  // const loginResponse = await server.post(loginUrl, {
  //   headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  //   body: 'username=dr&password=drpw',
  // })
  // expect(loginResponse.status).toBe(200)
  // const { accessToken: drToken } = await loginResponse.json()
  // expect(drToken).toBeTruthy()
  const res = await server.get(`${url}?hemarea=all`, options(drToken))
  expect(res.status).toBe(200)
})

it('/overviews/:shift api should response correct message', co.wrap(function * () {
  const data = yield server
    .get(`${url}?hemarea=all`, options(accessToken))
    .then(Overview.response.transform)

  const expected = yield Overviews.getOverviews('all')
  const rawData = data.toRaw(true, true)
  const protoExpect = Overview.response.encode(expected).toRaw(true, true)
  expect(rawData).toEqual(protoExpect)
}))

it('overviews api should response not modify if there is correct E-tag', async () => {
  const overviewRes = await server.get(`${url}?hemarea=all`, options(accessToken))
  const etag = await overviewRes.headers._headers.etag[0]
  const res = await server
    .get(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'If-None-Match': etag
      }
    })
  expect(res.status).toBe(304)
})

it('overviews api should response HTTP method wrong if using POST method', async () => {
  const res = await server.post(`${url}?hemarea=all`, options(accessToken))
  expect(res.status).toBe(405)
})

it('overviews api should response 401 if token is unauthorized', async () => {
  const res = await server.get(`${url}?hemarea=all`, options('whatever'))
  expect(res.status).toBe(401)
})

it('/overviews/:shift/abnormal/:c_id api should response correct message', co.wrap(function * () {
  const data = yield server
    .get(`${url}/abnormals/all?hemarea=all`, options(accessToken))
    .then(OverviewAbnormal.response.transform)

  const expected = yield Overviews.getAbnormals('all', 'all')
  expect(data).toEqual(expected)
}))

it('overviews abnormal api should response not modify if there is correct E-tag', async () => {
  const overviewRes = await server.get(`${url}/abnormals/all?hemarea=all`, options(accessToken))
  const etag = await overviewRes.headers._headers.etag[0]
  const res = await server
    .get(`${url}/abnormals/all?hemarea=all`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'If-None-Match': etag
      }
    })

  expect(res.status).toBe(304)
})

it('overviews api should response HTTP method wrong if using POST method', async () => {
  const res = await server.post(`${url}/abnormals/456?hemarea=all`, options(accessToken))
  expect(res.status).toBe(405)
})
