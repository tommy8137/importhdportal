import app from 'server/server-preloader'
import Protos from 'common/protos'
import fs from 'fs'
import co from 'co'
import { systemDB, hospitalDB } from 'server/helpers/database'
import moment from 'moment'

const TestServer = global.TestServer
const mayaAuth = global.mayaAuth
const { licenseFilePath } = global.config
const { SbpVar: proto } = Protos
const server = new TestServer(app.callback())
const postUrl = '/api/maya/alarm/sbp/status'
const doctorId = 'mis_id'
let accessToken
let drToken
const reqData = {
  hdrec_id: 'test',
  sbp_time: '2017-10-21 16:21:27',
  ev_status: 2,
  ev_situation:'透析過程順利無不適2222。',
  ev_process:'雙重核對醫囑，透析機面板設定皆正確。',
  ev_time:'2017-08-29 16:40',
}

const options = token => ({
  headers: {
    'Content-Type': 'application/octet-stream',
    'Authorization': `Bearer ${token}`,
  },
})

beforeEach(async () => {
  accessToken = await mayaAuth(server)('admin')
  drToken = await mayaAuth(server)('doctor')
  await systemDB.Query(`INSERT INTO webportal.risk
                    (pno, hemno, c_id, m_id, risk_time, type, sbp_time, ev_status) values
                    ('test', 'test', '1', '2', '13:22', 'lower', '2017-10-21 16:21:27', 0)`)
})
afterEach(async () => {
  await systemDB.Query(`DELETE FROM webportal.risk
                    WHERE pno = 'test'`)
})
it('update sbp status api should be update observation status successfully', async () => {
  const postBody = proto.request.transform(reqData)
  const res = await server
    .put(postUrl, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: postBody,
    })
  expect(res.status).toBe(204)
}
)
it('sbp status api should response 400 if body null', async () => {
  const postBody = proto.request.transform(reqData)
  const res = await server
    .put(postUrl, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Authorization': `Bearer ${accessToken}`,
      },
    })
  expect(res.status).toBe(400)
}
)

it('sbp status api should response HTTP method wrong if using GET method', async () => {
  const res = await server.get(postUrl, options(accessToken))
  expect(res.status).toBe(405)
})

it('sbp status  api should response 415 if Content-Type header is not application/octet-stream', async () => {
  const res = await server
    .put(postUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    })
  expect(res.status).toBe(415)
})
