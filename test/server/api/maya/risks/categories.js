import app from 'server/server-preloader'
import Protos from 'common/protos'
import co from 'co'
import Risks from 'server/models/maya/risks/risks'

const TestServer = global.TestServer
const mayaAuth = global.mayaAuth
const { BPVar: varProto, Reminding: remindingProto, BPProb: probProto, BPEstimation: estProto  } = Protos
const server = new TestServer(app.callback())
const categoryId = 1
const moduleId = 2
const url = '/api/maya/risks/categories'
const modulesUrl = `${url}/${categoryId}/modules`
const chartUrl = `${modulesUrl}/${moduleId}/charts`
const BPProbModuleId = 3
const BPEstModuleId = 4
const BPProbURL = `${modulesUrl}/${BPProbModuleId}/charts`
const BPEstURL = `${modulesUrl}/${BPEstModuleId}/charts`
const remindingUrl = `${modulesUrl}/${moduleId}/remindings`
const wrongChartUrl = `${modulesUrl}/2222/charts`
const predictData = {
  conductivity: 12.1,
  dia_temp_value: 32.2,
  uf: 2.5,
  blood_flow: 100,
  total_uf:1.5,
  dia_flow: 500,
  ns: 60,
  age: 40,
  dm: 0,
  temperature: 37.1,
  dryweight: 57.5,
  gender: 'M',
  sbp: 140,
  date: '2015-01-05',
  dialysis_year: 2,
  deltadia_temp_value: 0.5,
}

const bpProbPredictData = {
  conductivity: 12.1,
  dia_temp_value: 32.2,
  uf: 2.5,
  blood_flow: 100,
  total_uf: 3.5,
  dia_flow: 500,
  ns: 60,
  age: 40,
  dm: 0,
  temperature: 37.1,
  dryweight: 57.5,
  gender: 'M',
  sbp: 100,
  date: '2016-08-10',
  ul: 0,
  ulnum: 80,
  diff: 69,
  deltadia_temp_value: 0.5,
  dialysis_year: 2,
}

const bpEstPredictData = {
  conductivity: 12.1,
  dia_temp_value: 32.2,
  uf: 2.5,
  blood_flow: 100,
  total_uf: 3.5,
  dia_flow: 500,
  ns: 60,
  age: 40,
  dm: 0,
  temperature: 37.1,
  dryweight: 57.5,
  gender: 'M',
  sbp: 100,
  date: '2016-08-10',
  deltadia_temp_value: 0.5,
  dialysis_year: 2,
}

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

//Predict Risk Chart Tests
it('predict risk chart api c_id = 1 m_id = 2 should response correct message', co.wrap(function * () {
  const postBody = varProto.request.transform(predictData)
  const postCharts = Protos.BPVar.request.encode(predictData).toBuffer()
  const postData = yield server
    .post(chartUrl, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: postBody,
    })
    .then(varProto.response.transform)

  const postExpected = yield Risks.getCharts(postCharts, categoryId, moduleId)
  const chartData = Protos.BPVar.response.decode(postExpected)
  expect(postData).toEqual(chartData)
}))

it('predict risk chart api c_id = 1 m_id = 3 should response correct message', co.wrap(function * () {
  const postBody = probProto.request.transform(bpProbPredictData)
  const postCharts = Protos.BPProb.request.encode(bpProbPredictData).toBuffer()
  const postData = yield server
    .post(BPProbURL, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: postBody,
    })
    .then(probProto.response.transform)

  const postExpected = yield Risks.getCharts(postCharts, categoryId, BPProbModuleId)
  const chartData = Protos.BPProb.response.decode(postExpected)
  expect(postData).toEqual(chartData)
}))

it('predict risk chart api c_id = 1 m_id = 4 should response correct message', co.wrap(function * () {
  const postBody = estProto.request.transform(bpEstPredictData)
  const postCharts = Protos.BPEstimation.request.encode(bpEstPredictData).toBuffer()
  const postData = yield server
    .post(BPEstURL, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: postBody,
    })
    .then(estProto.response.transform)

  const postExpected = yield Risks.getCharts(postCharts, categoryId, BPEstModuleId)
  const chartData = Protos.BPEstimation.response.decode(postExpected)
  expect(postData).toEqual(chartData)
}))

it('predict risk chart api should response 400 if body null', co.wrap(function * () {
  const res = yield server.post(chartUrl, options(accessToken))
  expect(res.status).toBe(400)
}))

it('predict risk chart api should response 400 if predict module not found', co.wrap(function * () {
  const res = yield server
    .post(wrongChartUrl, {
      headers: {
        'Content-Type': 'application/octet-stream',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: 'postBody',
    })
  expect(res.status).toBe(400)
}))

it('predict risk chart api should response HTTP method wrong if using GET method', async () => {
  const res = await server.get(chartUrl, options(accessToken))
  expect(res.status).toBe(405)
})

it('predict risk chart api should response 415 if Content-Type header is not application/octet-stream', async () => {
  const res = await server
    .post(chartUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      }
    })
  expect(res.status).toBe(415)
})

//Predict Risk Reminding Tests
// it('predict risk reminding api should response correct message', co.wrap(function * ()  {
//   const postBody = Protos.Reminding.request.encode(predictData).toBuffer()
//   const postData = yield server
//     .post(remindingUrl, {
//       headers: {
//         'Content-Type': 'application/octet-stream',
//         'Authorization': `Bearer ${accessToken}`,
//       },
//     })
//     .then(remindingProto.response.transform)
//   const postExpected = yield Risks.getRemindings(postBody, categoryId, moduleId)
//   //const remindingData = Protos.Reminding.response.decode(postExpected)
//   expect(postData).toEqual(postExpected)
// }))

// it('predict risk reminding api should response HTTP method wrong if using GET method', async () => {
//   const res = await server.get(remindingUrl, options(accessToken))
//   expect(res.status).toBe(405)
// })

// it('predict risk reminding api should response 415 if Content-Type header is not application/octet-stream', async () => {
//   const res = await server
//     .post(remindingUrl, {
//       headers: {
//         'Authorization': `Bearer ${accessToken}`,
//       }
//     })
//   expect(res.status).toBe(415)
// })
