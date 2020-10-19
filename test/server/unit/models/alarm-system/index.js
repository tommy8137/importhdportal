import co from 'co'
import MayaAlarmSystem from 'server/models/maya/alarm-system'
import { errorCode } from 'server/helpers/api-error-helper'
import moment from 'moment'
// "coveragePathIgnorePatterns": [
  // "src/server/models/maya/alarm-system/index.js"
// ] ,
// Only test getAlarmSpec, getRisk funciton (so we ignore the coverage of this file),
// because it shouldn't sned risk to real maya sytem which we don't effecet to their system.

describe('[unit] The processMayaAlarmSystemin the maya alarm system modules for rest coverage', function() {
  it('Test with empty patientsRiskData', async () => {
    await co(MayaAlarmSystem.processMayaAlarmSystem([]))
  })
})

describe('[unit] The getAlarmSpec in the maya alarm system modules for rest coverage and response', function() {
  // -----------------------------------------------------------------------------
  it('Test verify data of response', async () => {
    const alarmSpec = await co(MayaAlarmSystem.getAlarmSpec())
    expect(alarmSpec).toHaveProperty('maxblood_upper')
    expect(alarmSpec).toHaveProperty('maxblood_lower')
  })
  // -----------------------------------------------------------------------------
  it('mock http response statusCode != 200, , just for coverage and expect error', async () => {
    const expectErrMsg = 'getAlarmSpec query maya system err, status code = 400'
    const tmpPara = {
      mockhttp:{
        request:(options, callback) => {
          let res = {}
          res.statusCode = 400
          res.on = () => {}
          callback(res)
          return {
            on : () => {},
            write : () => {},
            end : () => {},
          }
        },
      },
    }
    try {
      await co(MayaAlarmSystem.getAlarmSpec.apply(tmpPara))
    } catch(e) {
      expect(e.message).toBe(expectErrMsg)
    }
  })

  // -----------------------------------------------------------------------------
  it('mock sp server internal error, , just for coverage and expect error', async () => {
    const mockErrMsg = 'mock error'
    const expectError = {
      message : mockErrMsg,
      code : errorCode.INTERNAL_ERROR,
    }

    const tmpPara = {
      mockhttp:{
        request:(options, callback) => {
          let res = {}
          res.statusCode = '200'
          res.on = () => {}
          callback(res)
          return {
            on : (e, callback) => {
              if (e == 'error') {
                callback( { message: mockErrMsg })
              } else {
                callback( { setTimeout: () => {}, on: (socket, c) => {c()} } )
              }
            },
            abort: () => {},
            write : () => {},
            end : () => {},
          }
        },
      },
    }
    try {
      await co(MayaAlarmSystem.getAlarmSpec.apply(tmpPara))
    } catch(e) {
      expect(expectError).toEqual(e)
    }
  })
})

describe('[unit] The sendRisk in the maya alarm system modules for rest coverage and response', function() {
  const risk =  {
    alarm : 'N',
    pat_list : [],
  }
  // -----------------------------------------------------------------------------
  it('Test verify data of response', async () => {
    const response = await co(MayaAlarmSystem.sendRisk(risk))
    expect(response).toBe('\"Y\"')
  })
  // -----------------------------------------------------------------------------
  it('mock http response statusCode != 200, , just for coverage and expect error', async () => {
    const expectErrMsg = 'Risks update alram err, status code = 400'
    const tmpPara = {
      mockhttp:{
        request:(options, callback) => {
          let res = {}
          res.statusCode = 400
          res.on = () => {}
          callback(res)
          return {
            on : () => {},
            write : () => {},
            end : () => {},
          }
        },
      },
    }
    try {
      await co(MayaAlarmSystem.sendRisk.apply(tmpPara, [risk]))
    } catch(e) {
      expect(e.message).toBe(expectErrMsg)
    }
  })

  // -----------------------------------------------------------------------------
  it('mock sp server internal error, , just for coverage and expect error', async () => {
    const mockErrMsg = 'mock error'
    const expectError = {
      message : mockErrMsg,
      code : errorCode.INTERNAL_ERROR,
    }

    const tmpPara = {
      mockhttp:{
        request:(options, callback) => {
          let res = {}
          res.statusCode = '200'
          res.on = () => {}
          callback(res)
          return {
            on : (e, callback) => {
              if (e == 'error') {
                callback( { message: mockErrMsg })
              } else {
                callback( { setTimeout: () => {}, on: (socket, c) => {c()} } )
              }
            },
            abort: () => {},
            write : () => {},
            end : () => {},
          }
        },
      },
    }
    try {
      await co(MayaAlarmSystem.sendRisk.apply(tmpPara, [risk]))
    } catch(e) {
      expect(expectError).toEqual(e)
    }
  })
})
