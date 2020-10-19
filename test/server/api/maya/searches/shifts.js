import app from 'server/server-preloader'
import Protos from 'common/protos'
import co from 'co'
import { getShifts } from 'server/models/maya/searches/shifts'

const { Shift } = Protos
const TestServer = global.TestServer
const mayaAuth = global.mayaAuth
const server = new TestServer(app.callback())
const url = '/api/maya/searches/shifts'
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

it('admin should be able to access shift api', async () => {
  const res = await server.get(url, options(accessToken))
  expect(res.status).toBe(200)
})

it('get shifts api should response 401 if token is unauthorized', async () => {
  const res = await server.get(url, options('whatever'))
  expect(res.status).toBe(401)
})


it('doctor should be able to access shift api', async () => {
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

it('shift api should response correct message', async () => {
  const data = await server
    .get(url, options(accessToken))
    .then(Shift.response.transform)

  const expected = await co(getShifts())
  expect(data).toEqual(expected)
})
