import Settings from 'server/api/maya/admins/settings.js'
import co from 'co'
import Protos from 'common/protos'
import { errorCode } from 'server/helpers/api-error-helper'

const { Setting: settingProto } = Protos
const typeis = require('type-is')

describe('Settings api & update function', async() => {
  let parameters = this
  const settingsFunc = new Settings()
  it('[unit] request type is not application/octet-stream,  it should be return "The request should be Protocol buffer"', async () => {
    let tempParamet = {
      ...parameters,
      'request': {
        'type': 'application/octet-stream',
      },
      'state':{
        'user':{
          'id':'mis',
        },
      },
      'is': function(){ return false},
      'throw': function(state, errorString){ return errorString },
    }
    try {
      await co(settingsFunc.update.apply(tempParamet))
      expect(true).toEqual(false)
    } catch (err) {
      expect(err.message).toEqual('The request should be Protocol buffer')
    }
  })
  // -----------------------------------------------------------------------------
  it('[unit] timeout_minute 0, it should be return "modify column can not be null")', async () => {
    const body = {
      'timeout_minute': 0,
    }
    const postBody = settingProto.request.transform(body)

    let tempParamet = {
      ...parameters,
      request: {
        type: 'application/octet-stream',
      },
      state:{
        user:{
          id:'mis',
        },
      },
      is : jest.fn(
        function* is(contentType) {
          if (!contentType) return typeis(this.req)
          if (!Array.isArray(contentType)) contentType = [].slice.call(arguments)
          return typeis(this.req, contentType)
        }
      ),
      req: postBody,
    }

    try {
      await co(settingsFunc.update.apply(tempParamet))
      expect(false).toEqual(true)
    } catch (err) {
      const expectError = new Error('modify column can not be null')
      expectError.code = errorCode.NOT_PROTOBUF
      expect(err).toEqual(expectError)
    }
  })
  // -----------------------------------------------------------------------------
  it('[unit] should call the updateSettings with specific arguments', async () => {
    const mockReturnValue =  {
      'timeout_minute': 1,
    }
    const postBody = settingProto.request.transform(mockReturnValue)
    Protos.Setting.response.encode(mockReturnValue).toBuffer()
    let tempParamet = {
      ...parameters,
      request: {
        type: 'application/octet-stream'
      },
      state:{
        user:{
          id:'mis',
        },
      },
      is : jest.fn(
        function* is(contentType) {
          if (!contentType) return typeis(this.req)
          if (!Array.isArray(contentType)) contentType = [].slice.call(arguments)
          return typeis(this.req, contentType)
        }
      ),
      req: postBody,
      models:{
        updateSettings: jest.fn(
          function* updateSettings() {
            return mockReturnValue
          }
        ),
      },
    }

    const genThis = function () {
      return tempParamet
    }
    const Mock = jest.fn().mockImplementation(genThis)
    const mock = new Mock()
    await co(settingsFunc.update.apply(mock))
    expect(mock.models.updateSettings.mock.calls[0])
      .toEqual([tempParamet.state.user.id, { 'timeout_minute': 1 }])
  })

  // -----------------------------------------------------------------------------
  it('[unit] should return the Setting', async () => {
    const mockReturnValue =  {
      'timeout_minute': 1
    }
    const expectType = 'application/octet-stream'
    const postBody = settingProto.request.transform(mockReturnValue)
    const settingBuffer = Protos.Setting.response.encode(mockReturnValue).toBuffer()
    let tempParamet = {
      ...parameters,
      request: {
        type: 'application/octet-stream',
      },
      state:{
        user:{
          id:'mis',
        },
      },
      is : jest.fn(
        function* is(contentType) {
          if (!contentType) return typeis(this.req)
          if (!Array.isArray(contentType)) contentType = [].slice.call(arguments)
          return typeis(this.req, contentType)
        }
      ),
      req: postBody,
      models:{
        updateSettings: jest.fn(
          function* updateSettings() {
            return mockReturnValue
          }
        ),
      },
    }

    const genThis = function () {
      return tempParamet
    }
    const Mock = jest.fn().mockImplementation(genThis)
    const mock = new Mock()
    await co(settingsFunc.update.apply(mock))
    expect(mock.body).toEqual(settingBuffer)
    expect(mock.type).toEqual(expectType)
  })

  // -----------------------------------------------------------------------------
  it('[unit] should import Settings models when this.modules does not exist.', async () => {
    const mockReturnValue =  {
      'timeout_minute': 1,
    }
    const postBody = settingProto.request.transform(mockReturnValue)
    let tempParamet = {
      ...parameters,
      request: {
        type: 'application/octet-stream',
      },
      state:{
        user:{
          id:'mis',
        },
      },
      is : jest.fn(
        function* is(contentType) {
          if (!contentType) return typeis(this.req)
          if (!Array.isArray(contentType)) contentType = [].slice.call(arguments)
          return typeis(this.req, contentType)
        }
      ),
      req: postBody,
    }
    const genThis = function () {
      return tempParamet
    }
    co(settingsFunc.update.apply(genThis())).then(successHandler, errorHnadler)
  })

})

describe('Setting api & test fetch function', function() {
  let parameters = this
  const settingsFunc = new Settings()

  // -----------------------------------------------------------------------------
  it('[unit] should call the getSettings with specific arguments', async () => {
    const mockReturnValue =  {
      'timeout_minute': 1,
    }
    Protos.Setting.response.encode(mockReturnValue).toBuffer()
    let tempParamet = {
      ...parameters,
      request: {
        type: 'application/octet-stream',
      },
      state:{
        user:{
          id:'mis',
        },
      },
      is : jest.fn(
        function* is(contentType) {
          if (!contentType) return typeis(this.req)
          if (!Array.isArray(contentType)) contentType = [].slice.call(arguments)
          return typeis(this.req, contentType)
        }
      ),
      models:{
        getSettings: jest.fn(
          function* getSettings() {
            return mockReturnValue
          }
        ),
      },
    }

    const genThis = function () {
      return tempParamet
    }
    const Mock = jest.fn().mockImplementation(genThis)
    const mock = new Mock()
    await co(function* (){
      yield settingsFunc.fetch.apply(mock)
    })
    expect(mock.models.getSettings.mock.calls[0])
      .toEqual([tempParamet.state.user.id])
  })

  // -----------------------------------------------------------------------------
  it('[unit] should return the Setting', async () => {
    const mockReturnValue =  {
      'timeout_minute': 1,
    }
    const expectType = 'application/octet-stream'

    const settingBuffer = Protos.Setting.response.encode(mockReturnValue).toBuffer()
    let tempParamet = {
      ...parameters,
      request: {
        type: 'application/octet-stream',
      },
      state:{
        user:{
          id:'mis',
        },
      },
      is : jest.fn(
        function* is(contentType) {
          if (!contentType) return typeis(this.req)
          if (!Array.isArray(contentType)) contentType = [].slice.call(arguments)
          return typeis(this.req, contentType)
        }
      ),
      models:{
        getSettings: jest.fn(
          function* getSettings() {
            return mockReturnValue
          }
        ),
      },
    }

    const genThis = function () {
      return tempParamet
    }
    const Mock = jest.fn().mockImplementation(genThis)
    const mock = new Mock()
    await co(function* (){
      yield settingsFunc.fetch.apply(mock)
    })
    expect(mock.body).toEqual(settingBuffer)
    expect(mock.type).toEqual(expectType)
  })

  // -----------------------------------------------------------------------------
  it('[unit] should import Settings models when this.modules does not exist.', async () => {
    let tempParamet = {
      ...parameters,
      request: {
        type: 'application/octet-stream',
      },
      state:{
        user:{
          id:'mis',
        },
      },
      is : jest.fn(
        function* is(contentType) {
          if (!contentType) return typeis(this.req)
          if (!Array.isArray(contentType)) contentType = [].slice.call(arguments)
          return typeis(this.req, contentType)
        }
      ),
    }
    const genThis = function () {
      return tempParamet
    }
    co(settingsFunc.fetch.apply(genThis())).then(successHandler, errorHnadler)
  })
})


const successHandler = function() {

}
const errorHnadler = function(err) {
  // console.warn(err)
}
