import app from 'server/server-preloader'
import Protos from 'common/protos'

const { Setting: proto } = Protos
const TestServer = global.TestServer
const mayaAuth = global.mayaAuth
const server = new TestServer(app.callback())
const url = '/api/maya/admins/settings'
const doctorId = 'doctor_id'
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

it('admin should be able to access setting api', async () => {
  const res  = await server.get(url, options(accessToken))
  expect(res.status).toBe(200)
})

it('doctor should not be able to access setting api', async () => {
  // const loginUrl = '/api/maya/auth/login'

  // const loginResponse = await server.post(loginUrl, {
  //   headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  //   body: 'username=dr&password=drpw',
  // })
  // expect(loginResponse.status).toBe(200)
  // const { accessToken: drToken } = await loginResponse.json()
  // expect(drToken).toBeTruthy()

  const res = await server.get(url, options(drToken))
  expect(res.status).toBe(401)
})

it('setting api should response HTTP method wrong if using POST method', async () => {
  const res = await server.post(url, options(accessToken))
  expect(res.status).toBe(405)
})

it('put setting api should response 400 if body null', async () => {
  const res = await server.put(url, options(accessToken))
  expect(res.status).toBe(400)
})

it('put setting api should response 415 if Content-Type header is not application/octet-stream', async () => {
  const res = await server
    .put(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      }
    })
  expect(res.status).toBe(415)
})
