import AlarmModel from 'server/models/maya/alarm/alarm'
import app from 'server/server-preloader'
import Protos from 'common/protos'
import fs from 'fs'
import co from 'co'

const TestServer = global.TestServer
const mayaAuth = global.mayaAuth
const { licenseFilePath } = global.config
const { AlarmList: proto, Setting: settingProto } = Protos
const server = new TestServer(app.callback())
const url = '/api/maya/alarm/phrase'
const doctorId = 'mis_id'
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

it('admin should be able to access alarm phrase api', async () => {
  const res  = await server.get(url, options(accessToken))
  expect(res.status).toBe(200)
})

it('doctor should be able to access alarm phrase api', async () => {
  const res  = await server.get(url, options(drToken))
  expect(res.status).toBe(200)
})
it('alarm phrase api should response correct message', co.wrap(function * () {
  const data = yield server
    .get(url, options(accessToken))
    .then(proto.response.transform)
  const list = yield AlarmModel.getAlarmList()
  const expected = { AlarmLists:list }
  expect(data).toEqual(expected)
}))
it('alarm phrase api should response not modify if there is correct E-tag', async () => {
  const getAboutRes = await server.get(url, options(accessToken))
  const etag = await getAboutRes.headers._headers.etag[0]
  const res = await server
    .get(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'If-None-Match': etag,
      },
    })
  expect(res.status).toBe(304)
})

it('alarm phrase api should response HTTP method wrong if using POST method', async () => {
  const res = await server.post(url, options(accessToken))
  expect(res.status).toBe(405)
})
