import settings from 'common/protos/admins/setting.proto'
import thresholdsetting from 'common/protos/admins/thresholdsetting.proto'
import about from 'common/protos/admins/about.proto'
import agreements from 'common/protos/users/agreement.proto'
import schedules from 'common/protos/searches/schedule.proto'
import overviews from 'common/protos/searches/overview.proto'
import patients from 'common/protos/searches/patient.proto'
import dashboards from 'common/protos/searches/dashboard.proto'
import items from 'common/protos/searches/item.proto'
import results from 'common/protos/searches/result.proto'
import records from 'common/protos/searches/record.proto'
import bpvar from 'common/protos/risks/bpvar.proto'
import libs from 'common/protos/risks/libs.proto'
import personalthreshold from 'common/protos/risks/personalthreshold.proto'
import shifts from 'common/protos/searches/shift.proto'
import bpprob from 'common/protos/risks/bpprob.proto'
import estimation from 'common/protos/risks/estimation.proto'
import alarm from 'common/protos/alarm/message.proto'
import sbp from 'common/protos/alarm/sbp.proto'
import effective from 'common/protos/effective/list.proto'
import { canUseDOM } from 'app/utils/fetch'
import { errorCode, throwApiError } from 'server/helpers/api-error-helper'

let nexeRequire = require

if (global && global.require && typeof global.require == 'function') {
  nexeRequire = global.require
} else {
  nexeRequire = require
}

const protobuf = nexeRequire('protobufjs')

const Protos = {
  // SimulateActual: protoObject(simulate, 'Actual'),
  // SimulatePredict: protoObject(simulate, 'PredictRequest', 'PredictResponse'),
  Setting: protoObject(settings, 'Setting', 'Setting'),
  ThresholdSetting: protoObject(thresholdsetting, 'ThresholdSetting', 'ThresholdSetting'),
  About: protoObject(about, 'About', 'About'),
  Licenses: protoObject(about, 'Licenses', 'Licenses'),
  Agreement: protoObject(agreements, 'Agreements'),
  Schedule: protoObject(schedules, 'Schedule'),
  Overview: protoObject(overviews, 'Overview'),
  OverviewAbnormal: protoObject(overviews, 'AbnormalList'),
  Patient: protoObject(patients, 'Patient'),
  RiskSummary: protoObject(patients, 'RiskSummary'),
  Dashboard: protoObject(dashboards, 'Summary'),
  Item: protoObject(items, 'ItemsList'),
  ResultList: protoObject(results, 'TestResults'),
  Result: protoObject(results, 'TestResult'),
  RecordList: protoObject(records, 'DialyzeList'),
  Record: protoObject(records, 'Dialyze'),
  RecordDart: protoObject(records, 'DialyzeDart'),
  BPVar: protoObject(bpvar, 'ReqBPVariation', 'ResBPVariation'),
  Libs: protoObject(libs, 'Libs', 'Libs'),
  PersonalThreshold: protoObject(personalthreshold, 'PersonalThreshold', 'PersonalThreshold'),
  SetPersonalThreshold: protoObject(personalthreshold, 'SetPersonalThreshold', 'PersonalThreshold'),
  Shift: protoObject(shifts, 'Shifts', 'Shifts'),
  BPProb: protoObject(bpprob, 'ReqBPProbability', 'ResBPProbability'),
  BPEstimation: protoObject(estimation, 'ReqBPEstimation', 'ResBPEstimation'),
  AlarmList: protoObject(alarm, 'AlarmLists', 'AlarmLists'),
  SbpVar: protoObject(sbp, 'ReqSbp', 'ReqSbp'),
  SbpVarDart: protoObject(sbp, 'ReqSbpDart', 'ReqSbpDart'),
  EffectiveList: protoObject(effective, 'Lists', 'Lists'),
  DartList: protoObject(alarm, 'DartLists', 'DartLists'),
}

function protoObject(protoContent, requestMessage, responseMessage = requestMessage) {
  const ProtoRequest = protobuf.loadProto(protoContent).build(requestMessage)
  const ProtoResponse = protobuf.loadProto(protoContent).build(responseMessage)

  return {
    request: {
      ...getEnDn(ProtoRequest),
      transform: data => {
        if (__CLIENT__) {
          return new ProtoRequest(data).toArrayBuffer()
        } else {
          const stream = require('stream')
          const buffer = new ProtoRequest(data).toBuffer()
          const bufferStream = new stream.PassThrough()
          bufferStream.end(buffer)
          return bufferStream
        }
      }
    },
    response: {
      ...getEnDn(ProtoResponse),
      transform: response => {
        if (canUseDOM) {
          return response.arrayBuffer().then(buffer => ProtoResponse.decode(buffer))
        }
        else {
          return resolveBuffer(response.body).then(buffer => ProtoResponse.decode(buffer))
        }
      }
    }
  }
}

function getEnDn(Proto) {
  return {
    encode:
      data => {
        try {
          const encodeBuffer = new Proto(data)
          return encodeBuffer
        } catch (err) {
          throwApiError(err, errorCode.PROTOBUFJS_ERROR)
        }
      },
    decode:
      buffer => {
        try {
          const decodeBuffer = Proto.decode(buffer)
          return decodeBuffer
        } catch (err) {
          throwApiError(err, errorCode.PROTOBUFJS_ERROR)
        }
      }
  }
}

const resolveBuffer = body => new Promise((resolve, reject) => {
  const chunks = []
  body.on('data', chunk => {
    chunks.push(chunk)
  });

  body.on('end', () => {
    const buffer = Buffer.concat(chunks)
    resolve(buffer)
  })
  body.on('error', (e) => {
    reject(e)
  })
})

export default Protos

/**
 *

 */
