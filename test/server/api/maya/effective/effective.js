import app from 'server/server-preloader'
// import TestServer from 'fetch-test-server'
import Protos from 'common/protos'
import co from 'co'
import Effective from 'server/models/maya/effective/effective'
import getRawBody from 'raw-body'

const { EffectiveList: listProto } = Protos
const TestServer = global.TestServer
const mayaAuth = global.mayaAuth
const server = new TestServer(app.callback())

let accessToken
const options = token => ({
  headers: {
    'Content-Type': 'application/octet-stream',
    'Authorization': `Bearer ${token}`,
  },
})

beforeAll(async () => {
  accessToken = await mayaAuth(server)('admin')
})

it('effective all list api should response correct message', co.wrap(function * () {
  const url = '/api/maya/effective/lists'
  const data = yield server
    .get(url, options(accessToken))
    .then(listProto.response.transform)

  const expected = yield Effective.getList()
  expect(data).toEqual({ 'year': expected })
}))

it('effective pdf api should response correct message', co.wrap(function * () {
  const url = '/api/maya/effective/year/2017/lang/en'
  const data = yield server
    .get(url, options(accessToken))
  const body = yield getRawBody(data.body)

  const expected = yield Effective.getPDF('2017', 'en')
  expect(body).toEqual(body)
}))
