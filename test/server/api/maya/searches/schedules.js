import app from 'server/server-preloader'
import Protos from 'common/protos'
import co from 'co'
import moment from 'moment'

const { Schedule: proto } = Protos
const TestServer = global.TestServer
const mayaAuth = global.mayaAuth
const server = new TestServer(app.callback())
const date = moment().format('YYYY-MM-DD')
const url = `/api/maya/searches/schedules?start_date=${date}&end_date=${date}`
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

it('admin should be able to access schedule api', async () => {
  const res = await server.get(url, options(accessToken))
  expect(res.status).toBe(200)
})

it('get schedules api should response 401 if token is unauthorized', async () => {
  const res = await server.get(url, options('whatever'))
  expect(res.status).toBe(401)
})

it('doctor should be able to access schedule api', async () => {
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

it('schedule api should response correct message', co.wrap(function * () {
  const data = yield server
    .get(url, options(accessToken))
    .then(proto.response.transform)

  const Schedules = require('server/models/maya/searches/schedules')
  const expected = yield Schedules.getSchedules(date, date)
  expect(data).toEqual(expected)
}))
