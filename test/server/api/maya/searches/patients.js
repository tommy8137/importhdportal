import app from 'server/server-preloader'
import Protos from 'common/protos'
import co from 'co'
import Tests from 'server/models/maya/searches/tests'
import moment from 'moment'
const { Patient: proto, RiskSummary: proto2, Dashboard: proto3, RecordList: proto7, Record: proto8, Item, ResultList, Result } = Protos
const TestServer = global.TestServer
const mayaAuth = global.mayaAuth
const server = new TestServer(app.callback())
const pid = '0001157440'
const nonExistToken = '9527'
const rid = '0207A008BE915FD7742C85C70AC3C8F0'

const url = `/api/maya/searches/patients/${pid}`
const dashboardsUrl = `/api/maya/searches/patients/${pid}/dashboards/${rid}`

const labDataPid = '01070743'
const tiId = 'FBI000@Lipemic (L)'
const trId = `${labDataPid}+20160803`
const testItemUrl = `/api/maya/searches/patients/${labDataPid}/test_items/${tiId}`
const testResultsUrl = `/api/maya/searches/patients/${labDataPid}/test_results`
const testResultUrl = `/api/maya/searches/patients/${labDataPid}/test_results/${trId}`
const date = moment().format('YYYY-MM-DD')
const recordsUrl = `/api/maya/searches/patients/${pid}/records?start_date=${date}&end_date=${date}`
const pid8 = '06316164'
const rid8 = 'ECAD10F9990C22D5467347011AA818BB'
const recordUrl = `/api/maya/searches/patients/${pid8}/records/${rid8}`


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

it('admin should be able to access patient api', async () => {
  const res  = await server.get(`/api/maya/searches/patients/${pid}`, options(accessToken))
  expect(res.status).toBe(200)
})

it(`${testItemUrl} should response 401 if token is unauthorized`, async () => {
  const res  = await server.get(testItemUrl, options('whatever'))
  expect(res.status).toBe(401)
})

it(`${testResultsUrl} should response 401 if token is unauthorized`, async () => {
  const res  = await server.get(testResultsUrl, options('whatever'))
  expect(res.status).toBe(401)
})

it(`${testResultUrl} should response 401 if token is unauthorized`, async () => {
  const res  = await server.get(testResultUrl, options('whatever'))
  expect(res.status).toBe(401)
})

it('doctor should be able to access patient api', async () => {
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

it(`${dashboardsUrl} api should response correct message`, co.wrap(function * () {
  const data = yield server
    .get(dashboardsUrl, options(accessToken))
    .then(proto3.response.transform)

  const Dashboards = require('server/models/maya/searches/dashboards')
  const expected = yield Dashboards.getDashboards(pid, rid)
  expect(data).toEqual(expected)
}))

it(`${dashboardsUrl} api with token ${nonExistToken} should response 401`, co.wrap(function * () {
  const res = yield server
    .get(dashboardsUrl, options(nonExistToken))

  expect(res.status).toBe(401)
}))

it(`${testItemUrl} api should response correct message`, co.wrap(function * () {
  const data = yield server
    .get(testItemUrl, options(accessToken))
    .then(Item.response.transform)

  const expected = yield Tests.getTestItems(labDataPid, tiId)
  expect(data).toEqual(expected)
}))

it(`${testResultsUrl} api should response correct message`, co.wrap(function * () {
  const data = yield server
    .get(testResultsUrl, options(accessToken))
    .then(ResultList.response.transform)

  const expected = yield Tests.getTestResults(labDataPid)
  expect(data).toEqual(expected)
}))

it(`${testResultUrl} api should response correct message`, co.wrap(function * () {
  const data = yield server
    .get(testResultUrl, options(accessToken))
    .then(Result.response.transform)

  const expected = yield Tests.getTestResult(labDataPid, trId)
  const rawData = data.toRaw(true, true)
  const protoExpect = Result.response.encode(expected)
  expect(rawData).toEqual(protoExpect)
}))

it(`${recordsUrl} api should response correct message`, co.wrap(function * () {
  const data = yield server
    .get(recordsUrl, options(accessToken))
    .then(proto7.response.transform)

  const Records = require('server/models/maya/searches/records').default
  const expected = yield Records.getRecords(pid)
  expect(data).toEqual(expected)
}))

it(`${recordUrl} api should response correct message`, co.wrap(function * (){
  const data = yield server
    .get(recordUrl, options(accessToken))
    .then(proto8.response.transform)

  const Records = require('server/models/maya/searches/records').default
  const expected = yield Records.getRecord(pid8, rid8)
  const rawData = data.toRaw(true, true)
  const protoExpect = proto8.response.encode(expected).toRaw(true, true)
  expect(rawData).toEqual(protoExpect)
}))
