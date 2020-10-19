import Agreements from 'server/api/maya/users/agreements.js'
import co from 'co'
import Protos from 'common/protos'
import { errorCode } from 'server/helpers/api-error-helper'
const { Agreement: agreementProto } = Protos
const typeis = require('type-is')
describe('[unit] Agreements api & test fetch function', function() {
  let parameters = this
  parameters = {
    ...parameters,
    'state': {
      'user': {
        'id': 'mis',
      },
    },
    'cookies':{
      'set': function(){},
    },
  }
  const agreementsFunc = new Agreements()
  const expectType = 'application/octet-stream'
  const mockReturnValue =   {
    'always_show': 1,
  }

  const agreementsBuffer = Protos.Agreement.response.encode(mockReturnValue).toBuffer()
  const models = {
    getAgreements: jest.fn(
      function* getAgreements() {
        return mockReturnValue
      }
    ),
  }

  // -----------------------------------------------------------------------------
  it('[unit] should call the getAgreements with specific arguments', async () => {
    let tempParamet = {
      ...parameters,
      models,
    }
    const genThis = function () {
      return tempParamet
    }
    const Mock = jest.fn().mockImplementation(genThis)
    const mock = new Mock()
    await co(agreementsFunc.fetch.apply(mock))
    expect(mock.models.getAgreements.mock.calls[0])
      .toEqual([tempParamet.state.user.id])
  })
  // -----------------------------------------------------------------------------
  it('[unit] should return the agreement', async () => {
    const tempParamet = {
      ...parameters,
      models,
    }
    const genThis = function () {
      return tempParamet
    }
    const Mock = jest.fn().mockImplementation(genThis)
    const mock = new Mock()
    await co(agreementsFunc.fetch.apply(mock))
    expect(mock.body).toEqual(agreementsBuffer)
    expect(mock.type).toEqual(expectType)
  })
  // -----------------------------------------------------------------------------
  it('[unit] should import Agreement models when this.models does not exist.', async () => {
    const tempParamet = {
      ...parameters,
    }
    const genThis = function () {
      return tempParamet
    }
    co(agreementsFunc.fetch.apply(genThis())).then(successHandler, errorHnadler)
  })
})

describe('[unit] Agreements api & test update function', async () =>  {
  const mockReturnValue =   {
    'always_show': 1,
  }

  let parameters = this
  parameters = {
    ...parameters,
    'state': {
      'user': {
        'id': 'mis',
      },
    },
    'cookies':{
      'set': function(){},
    },
  }
  const agreementsFunc = new Agreements()
  const agreementsBuffer = Protos.Agreement.response.encode(mockReturnValue).toBuffer()
  const expectType = 'application/octet-stream'
  // -----------------------------------------------------------------------------
  it('[unit] request type is not application/octet-stream, it should be return "The request should be Protocol buffer"', async () => {
    let tempParamet = {
      ...parameters,
      request: {
        'type': 'application/octet-stream',
      },
      is: function(){ return false},
      throw: function(state, errorString){ return errorString },
    }
    try {
      await co(agreementsFunc.update.apply(tempParamet))
    } catch (err) {
      expect(err.message).toEqual('The request should be Protocol buffer')
    }
  })
  // -----------------------------------------------------------------------------
  it('[unit] always_show is 0, so it should be return modify column can not be null)', async () => {
    const body = {
      'always_show': 0,
    }
    const postBody = agreementProto.request.transform(body)
    // const postCharts = Protos.Agreement.request.encode(body).toBuffer()

    let tempParamet = {
      ...parameters,
      'request': {
        'type': 'application/octet-stream',
      },
      is : jest.fn(
        function* is(contentType) {
          if (!contentType) return typeis(this.req)
          if (!Array.isArray(contentType)) contentType = [].slice.call(arguments)
          return typeis(this.req, contentType)
        }
      ),
      req:postBody,
    }

    try {
      await co(agreementsFunc.update.apply(tempParamet))
    } catch (err) {
      const expectError = new Error('modify column can not be null')
      expectError.code = errorCode.NOT_PROTOBUF
      expect(err).toEqual(expectError)
    }
  })
  // -----------------------------------------------------------------------------
  it('[unit] should call the updateAgreements with specific arguments', async () => {
    const body = {
      'always_show': 1,
    }
    const postBody = agreementProto.request.transform(body)
    let tempParamet = {
      ...parameters,
      'request': {
        'type': 'application/octet-stream',
      },
      is : jest.fn(
        function* is(contentType) {
          if (!contentType) return typeis(this.req)
          if (!Array.isArray(contentType)) contentType = [].slice.call(arguments)
          return typeis(this.req, contentType)
        }
      ),
      models:{
        updateAgreements: jest.fn(
          function* updateAgreements() {
            return mockReturnValue
          }
        ),
      },
      req:postBody,
    }
    const genThis = function () {
      return tempParamet
    }
    const Mock = jest.fn().mockImplementation(genThis)
    const mock = new Mock()
    await co(agreementsFunc.update.apply(mock))
    expect(mock.models.updateAgreements.mock.calls[0])
      .toEqual([parameters.state.user.id, body])
  })
  // -----------------------------------------------------------------------------
  it('[unit] should return the agreement', async () => {
    const body = {
      'always_show': 1,
    }
    const postBody = agreementProto.request.transform(body)
    // const postCharts = Protos.Agreement.request.encode(body).toBuffer()

    let tempParamet = {
      ...parameters,
      'request': {
        'type': 'application/octet-stream',
      },
      is : jest.fn(
        function* is(contentType) {
          if (!contentType) return typeis(this.req)
          if (!Array.isArray(contentType)) contentType = [].slice.call(arguments)
          return typeis(this.req, contentType)
        }
      ),
      models:{
        updateAgreements: jest.fn(
          function* updateAgreements() {
            return mockReturnValue
          }
        ),
      },
      req:postBody,
    }
    const genThis = function () {
      return tempParamet
    }
    const Mock = jest.fn().mockImplementation(genThis)
    const mock = new Mock()
    await co(agreementsFunc.update.apply(mock))
    expect(mock.body).toEqual(agreementsBuffer)
    expect(mock.type).toEqual(expectType)
  })
  // -----------------------------------------------------------------------------
  it('[unit] should import Agreement models when this.models does not exist.', async () => {
    const body = {
      'always_show': 1,
    }
    const postBody = agreementProto.request.transform(body)
    // const postCharts = Protos.Agreement.request.encode(body).toBuffer()

    let tempParamet = {
      ...parameters,
      'request': {
        'type': 'application/octet-stream',
      },
      is : jest.fn(
        function* is(contentType) {
          if (!contentType) return typeis(this.req)
          if (!Array.isArray(contentType)) contentType = [].slice.call(arguments)
          return typeis(this.req, contentType)
        }
      ),
      req:postBody,
    }
    const genThis = function () {
      return tempParamet
    }
    co(agreementsFunc.update.apply(genThis())).then(successHandler, errorHnadler)
  })
})

const successHandler = function() {

}
const errorHnadler = function(err) {
  console.warn(err)
}
