import app from 'server/server-preloader'
import Protos from 'common/protos'
import fs from 'fs'
import co from 'co'

const TestServer = global.TestServer
const mayaAuth = global.mayaAuth
const { licenseFilePath } = global.config
const { Agreement: proto, Setting: settingProto } = Protos
const server = new TestServer(app.callback())
const url = '/api/maya/users/agreements'
const settingsUrl = '/api/maya/admins/settings'
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

it('[license] admin should be able to access agreement api', async () => {
  const res  = await server.get(url, options(accessToken))
  expect(res.status).toBe(200)
})

it('[license] doctor should be able to access agreement api', async () => {
  const res = await server.get(url, options(drToken))
  expect(res.status).toBe(200)
})

// it( 2.10 no setting
//   '[license] get and put agreements settings api should response correct message and Etag',
//   co.wrap(function * () {
//     // get agreements test
//     const getData = yield server
//       .get(url, options(accessToken))
//       .then(proto.response.transform)

//     const Agreements = require('server/models/maya/users/agreements')
//     const getExpected = yield Agreements.getAgreements(doctorId)
//     expect(getData).toEqual(getExpected)

//     // put agreements test
//     const postBody = proto.response.encode({ always_show: 1 }).toBuffer().toString()
//     const putData = yield server
//       .put('/api/maya/users/agreements', {
//         headers: {
//           'Content-Type': 'application/octet-stream',
//           'Authorization': `Bearer ${accessToken}`,
//         },
//         body: postBody,
//       })
//       .then(proto.response.transform)
//     const Agree = require('server/models/maya/users/agreements')
//     const updateAgreement = { always_show: 1 }
//     const putExpected = yield Agree.updateAgreements(doctorId, updateAgreement)
//     expect(putData).toEqual(putExpected)

//     // agreements Etag test
//     const getAgreementRes = yield server.get(url, options(accessToken))
//     const etag = getAgreementRes.headers._headers.etag[0]
//     const res = yield server
//       .get(url, {
//         headers: {
//           'Authorization': `Bearer ${accessToken}`,
//           'If-None-Match': etag,
//         },
//       })
//     expect(res.status).toBe(304)

//     // get settings test
//     const settingsData = yield server
//       .get(settingsUrl, options(accessToken))
//       .then(settingProto.response.transform)

//     const Settings = require('server/models/maya/admins/settings')
//     const settingsExpected = yield Settings.getSettings(doctorId)
//     expect(settingsData).toEqual(settingsExpected)

//     // put settings test
//     const settingsPostBody = settingProto.response.encode({ timeout_minute: 10 }).toBuffer().toString()
//     const settingsPutData = yield server
//       .put(settingsUrl, {
//         headers: {
//           'Content-Type': 'application/octet-stream',
//           'Authorization': `Bearer ${accessToken}`,
//         },
//         body: settingsPostBody,
//       })
//       .then(settingProto.response.transform)

//     const updateSettings = { timeout_minute: 10 }
//     const settingsPutExpected = yield Settings.updateSettings(doctorId, updateSettings)
//     expect(settingsPutData).toEqual(settingsPutExpected)

//     // settings Etag test
//     const settingRes = yield server.get(url, options(accessToken))
//     const settingetag = settingRes.headers._headers.etag[0]
//     const settingres = yield server
//       .get(url, {
//         headers: {
//           'Authorization': `Bearer ${accessToken}`,
//           'If-None-Match': settingetag,
//         },
//       })
//     expect(settingres.status).toBe(304)
//   }
// ))

it('[license] agreement api should response HTTP method wrong if using POST method', async () => {
  const res = await server.post(url, options(accessToken))
  expect(res.status).toBe(405)
})

it('[license] put agreement api should response 400 if body null', async () => {
  const res = await server.put(url, options(accessToken))
  expect(res.status).toBe(400)
})

it('[license] put agreement api should response 415 if Content-Type header is not application/octet-stream', async () => {
  const res = await server
    .put(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    })
  expect(res.status).toBe(415)
})


// it('[license] get agreement api should response 403 if LICENSE EXPIRED', async () => {
//   fs.accessSync(licenseFilePath, fs.R_OK | fs.W_OK)
//   fs.writeFileSync(licenseFilePath, crypto.encrypt('-1'), 'utf8')
//   const readFile = fs.readFileSync(licenseFilePath, 'utf8')

//   const loginUrl = '/api/v1alpha/auth/login'

//   const loginResponse = await server.post(loginUrl, {
//     headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
//     body: 'username=dr&password=drpw',
//   })

//   const res = await server.get(url, options(accessToken))
//   expect(res.status).toBe(403)
//   fs.writeFileSync(licenseFilePath, crypto.encrypt('365'), 'utf8')
// })
