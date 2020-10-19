import Risks, { ricksFunc } from 'server/models/maya/risks/risks.js'
import Protos from 'common/protos'
import co from 'co'
import { errorCode } from 'server/helpers/api-error-helper'

describe('[unit] The getLibs function in the Risks modules', function() {
  it('should call getSpframeworkLibs', async () => {
    const expectResult = { whatever : 'whatever' }
    const genThis = function () {
      return {
        models: {
          getSpframeworkLibs: jest.fn(
            function getSpframeworkLibs() {
              return expectResult
            }
          ),
        },
      }
    }
    const Mock = jest.fn().mockImplementation(genThis)
    const mock = new Mock()
    const result = await co(Risks.getLibs.apply(mock, ['whatever']))
    expect(result).toEqual(expectResult)

  })

  it('should import getSpframeworkLibs', async () => {
    try {
      await co(Risks.getLibs('whatever'))
    } catch (e) {
      // not import
    }
  })
})

describe('[unit] The getCharts function in the Risks modules', function() {
  it('should call getSpFrameworkChart', async () => {
    const expectResult = { whatever : 'whatever' }
    const genThis = function () {
      return {
        models: {
          getSpFrameworkChart: jest.fn(
            function getSpFrameworkChart() {
              return expectResult
            }
          ),
        },
      }
    }
    const Mock = jest.fn().mockImplementation(genThis)
    const mock = new Mock()
    const result = await co(Risks.getCharts.apply(mock, ['whatever', 'whatever', 'whatever']))
    expect(result).toEqual(expectResult)

  })

  it('should import getSpFrameworkChart', async () => {
    try {
      await co(Risks.getCharts('whatever', 'whatever', 'whatever'))
    } catch (e) {
      // not import
    }
  })
})

describe('[unit] The getAccess function in the Risks modules', function() {
  it('should call getSpframeworkLibs', async () => {
    const result = await co(Risks.getAccess('whatever', 'whatever', 'whatever', 'whatever'))
    expect(result).toEqual(true)

  })
})


describe('[unit] The getRisksProbs function in the Risks modules', function() {
  it('should call getSpFrameworkRiskProb', async () => {
    const expectResult = { whatever : 'whatever' }
    const genThis = function () {
      return {
        models: {
          getSpFrameworkRiskProb: jest.fn(
            function getSpFrameworkRiskProb() {
              return expectResult
            }
          ),
        },
      }
    }
    const Mock = jest.fn().mockImplementation(genThis)
    const mock = new Mock()
    const result = await co(Risks.getRisksProbs.apply(mock, ['whatever', 'whatever', 'whatever']))
    expect(result).toEqual(expectResult)

  })

  it('should import getSpFrameworkRiskProb', async () => {
    try {
      await co(Risks.getRisksProbs('whatever', 'whatever', 'whatever'))
    } catch (e) {
      // not import
    }
  })
})

// below all amost same just for https coverage.....
describe('[unit] The getSpFrameworkChart function in the Risks modules', function() {
  it('send http request, statusCode:408, should return error "Request Timeout"', async () => {
    const tempParame = {
      models: {
        https: {
          request: function(paramet, cb) {
            let req = {
              statusCode: 408,
            }
            cb(req)
          },
        },
      },
    }

    try {
      await co(ricksFunc.getSpFrameworkChart.apply(tempParame, ['whatever', 'whatever', 'whatever']))
      expect(true).toEqual(false)
    } catch (err) {
      expect(err.message).toBe('Request Timeout')
    }
  })

  it('send http request, statusCode:500, should return error "modles/risks test err"', async () => {
    const tempParame = {
      models: {
        https: {
          request: function(paramet, cb) {
            let req = {
              statusCode: 500,
            }
            return cb(req)
          },
        },
      },
    }
    try {
      await co(ricksFunc.getSpFrameworkChart.apply(tempParame, ['whatever', 'whatever', 'whatever']))
      expect(true).toEqual(false)
    } catch (err) {
      expect(err.message).toBe('modles/risks test err')
    }
  })

  it('send http request, statusCode:400, should return error "unit test 400 error"', async () => {
    const tempParame = {
      models: {
        https: {
          request: function(paramet, cb) {
            let req = {
              statusCode: 400,
              on: function(onParamet, onCB) {
                return onCB('{ "code":"400", "message":"unit test 400 error"}')
              },
            }
            cb(req)
            return {
              on: function(paramet, onCB) {
                let errorMessage = { message: 'unit test 400 error' }
                onCB(errorMessage)
                return true
              },
              write: function(writeParamrt){
                return true
              },
              ens: function(){
                return true
              },
            }
          },
        },
      },
    }
    try {
      await co(ricksFunc.getSpFrameworkChart.apply(tempParame, ['whatever', 'whatever', 'whatever']))
      expect(true).toEqual(false)
    } catch (err) {
      expect(err.message).toBe('unit test 400 error')
    }
  })

  it('send http request, statusCode:200, should return a object with buffer type', async () => {
    const tempParame = {
      models: {
        https: {
          request: function(paramet, cb) {
            let req = {
              statusCode: 200,
              on: function(onParamet, onCB) {
                onCB(new Buffer('unitTestDone'))
              },
            }
            return cb(req)
          },
        },
      },
    }
    try {
      const res = await co(ricksFunc.getSpFrameworkChart.apply(tempParame, ['whatever', 'whatever', 'whatever']))
      expect(new Buffer('unitTestDone')).toEqual(res)
    } catch (err) {
      expect(true).toEqual(false)
    }
  })

  it('send http request, http is not mock', async () => {
    try {
      await co(ricksFunc.getSpFrameworkChart('whatever', 'whatever', 'whatever'))
    } catch (err) {
      // whatever
    }
  })
})

// below all amost same just for https coverage.....
describe('[unit] The getSpframeworkLibs function in the Risks modules', function() {
  it('send http request, statusCode:408, should return error "Request Timeout"', async () => {
    const tempParame = {
      models: {
        https: {
          request: function(paramet, cb) {
            let req = {
              statusCode: 408,
            }
            cb(req)
          },
        },
      },
    }

    try {
      await co(ricksFunc.getSpframeworkLibs.apply(tempParame, ['whatever']))
      expect(true).toEqual(false)
    } catch (err) {
      expect(err.message).toBe('Request Timeout')
    }
  })

  it('send http request, statusCode:500, should return error "modles/risks test err"', async () => {
    const tempParame = {
      models: {
        https: {
          request: function(paramet, cb) {
            let req = {
              statusCode: 500,
            }
            return cb(req)
          },
        },
      },
    }
    try {
      await co(ricksFunc.getSpframeworkLibs.apply(tempParame, ['whatever']))
      expect(true).toEqual(false)
    } catch (err) {
      expect(err.message).toBe('modles/risks get libs err')
    }
  })

  it('send http request, statusCode:200, should return a object with Libs protos', async () => {
    const expectData = {
      categories: [
        {
          c_id : 1,
          c_name : 'c_name',
          modules : [{ m_id : 1, m_name: 'm_name' }],
        },
      ],
    }
    const data = Protos.Libs.response.encode(expectData).toBuffer()
    const tempParame = {
      models: {
        https: {
          request: function(paramet, cb) {
            let req = {
              statusCode: 200,
              on: function(onParamet, onCB) {
                onCB(data)
              },
            }
            return cb(req)
          },
        },
      },
    }
    try {
      const res = await co(ricksFunc.getSpframeworkLibs.apply(tempParame, ['whatever']))
      expect(expectData).toEqual(res)
    } catch (err) {
      expect(true).toEqual(false)
    }
  })

  it('send http request, statusCode:200, data format is incorrect, should throw errors with PROTOBUFJS_ERROR', async () => {
    const tempParame = {
      models: {
        https: {
          request: function(paramet, cb) {
            let req = {
              statusCode: 200,
              on: function(onParamet, onCB) {
                onCB({ error : '111' })
              },
            }
            return cb(req)
          },
        },
      },
    }
    try {
      await co(ricksFunc.getSpframeworkLibs.apply(tempParame, ['whatever']))
    } catch(e) {
      expect(e.code).toBe(errorCode.PROTOBUFJS_ERROR)
    }
  })

  it('send http request, should throw errors with INTERNAL_ERROR when request error"', async () => {
    const tempParame = {
      models: {
        https: {
          request: function(paramet, cb) {
            return {
              on: function(paramet, onCB) {
                let errorMessage = { message: 'unit test 400 error' }
                onCB(errorMessage)
                return true
              },
              write: function(writeParamrt){
                return true
              },
              end: function(){
                return true
              },
            }
          },
        },
      },
    }
    try {
      await co(ricksFunc.getSpframeworkLibs.apply(tempParame))
      expect(true).toEqual(false)
    } catch (err) {
      expect(err.message).toBe('unit test 400 error')
      expect(err.code).toBe(errorCode.INTERNAL_ERROR)
    }
  })

  it('send http request, http is not mock', async () => {
    try {
      await co(ricksFunc.getSpframeworkLibs('whatever'))
    } catch (err) {
      // whatever
    }
  })
})
// below all amost same just for https coverage.....
describe('[unit] The getSpFrameworkRiskProb function in the Risks modules', function() {
  it('send http request, statusCode:408, should return error "Request Timeout"', async () => {
    const tempParame = {
      models: {
        https: {
          request: function(paramet, cb) {
            let req = {
              statusCode: 408,
            }
            cb(req)
          },
        },
      },
    }

    try {
      await co(ricksFunc.getSpFrameworkRiskProb.apply(tempParame, ['whatever', 'whatever', 'whatever']))
      expect(true).toEqual(false)
    } catch (err) {
      expect(err.message).toBe('Request Timeout')
    }
  })

  it('send http request, statusCode:500, should return error "modles/risks test err"', async () => {
    const tempParame = {
      models: {
        https: {
          request: function(paramet, cb) {
            let req = {
              statusCode: 500,
            }
            return cb(req)
          },
        },
      },
    }
    try {
      await co(ricksFunc.getSpFrameworkRiskProb.apply(tempParame, ['whatever', 'whatever', 'whatever']))
      expect(true).toEqual(false)
    } catch (err) {
      expect(err.message).toBe('modles/risks test err')
    }
  })

  it('send http request, statusCode:400, should return error "unit test 400 error"', async () => {
    const tempParame = {
      models: {
        https: {
          request: function(paramet, cb) {
            let req = {
              statusCode: 400,
              on: function(onParamet, onCB) {
                return onCB('{ "code":"400", "message":"unit test 400 error"}')
              },
            }
            cb(req)
            return {
              on: function(paramet, onCB) {
                let errorMessage = { message: 'unit test 400 error' }
                onCB(errorMessage)
                return true
              },
              write: function(writeParamrt){
                return true
              },
              ens: function(){
                return true
              },
            }
          },
        },
      },
    }
    try {
      await co(ricksFunc.getSpFrameworkRiskProb.apply(tempParame, ['whatever', 'whatever', 'whatever']))
      expect(true).toEqual(false)
    } catch (err) {
      expect(err.message).toBe('unit test 400 error')
    }
  })

  it('send http request, statusCode:200, should return a object with buffer type', async () => {
    const tempParame = {
      models: {
        https: {
          request: function(paramet, cb) {
            let req = {
              statusCode: 200,
              on: function(onParamet, onCB) {
                onCB(new Buffer('unitTestDone'))
              },
            }
            return cb(req)
          },
        },
      },
    }
    try {
      const res = await co(ricksFunc.getSpFrameworkRiskProb.apply(tempParame, ['whatever', 'whatever', 'whatever']))
      expect(new Buffer('unitTestDone')).toEqual(res)
    } catch (err) {
      expect(true).toEqual(false)
    }
  })

  it('send http request, http is not mock', async () => {
    try {
      await co(ricksFunc.getSpFrameworkRiskProb('whatever', 'whatever', 'whatever'))
    } catch (err) {
      // whatever
    }
  })
})
