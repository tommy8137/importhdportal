import About from 'server/api/maya/admins/about.js'
import co from 'co'
import Protos from 'common/protos'
import Licenses from 'server/helpers/licenses'
import { validLicenseInfo } from 'server/helpers/licenses/license-entries'
import { throwApiError } from 'server/helpers/api-error-helper'

describe('About api & test fetch function', function() {
  let parameters = this
  const aboutFunc = new About()
  const expectType = 'application/octet-stream'
  const mockReturnValue =      {
    'version': '<version>',
    'license_key': '<license_key>',
    'valid_date': '<valid_date>',
  }

  const aboutBuffer = Protos.About.response.encode(mockReturnValue).toBuffer()
  const models = {
    getAbout: jest.fn(
      function* getAbout() {
        return mockReturnValue
      }
    ),
  }
  // -----------------------------------------------------------------------------
  it('[unit] should return the about', async () => {
    const tempParamet = {
      ...parameters,
      models,
    }
    const genThis = function () {
      return tempParamet
    }
    const Mock = jest.fn().mockImplementation(genThis)
    const mock = new Mock()
    await co(aboutFunc.fetch.apply(mock))
    expect(mock.body).toEqual(aboutBuffer)
    expect(mock.type).toEqual(expectType)
  })
  // -----------------------------------------------------------------------------
  it('[unit] should import About models when this.modules does not exist.', async () => {
    const tempParamet = {
      ...parameters,
    }
    const genThis = function () {
      return tempParamet
    }
    co(aboutFunc.fetch.apply(genThis())).then(successHandler, errorHnadler)
  })
})

describe('About api & update function', function() {
  let parameters = this
  const aboutFunc = new About()

  it('[unit] request type is not application/json, so it should be return "The request should be json"', async () => {
    let tempParamet = {
      ...parameters,
      'request': {
        'type': 'application/json',
        'license_key':'',
      },
      'is': function(){return false},
      'throw': function(state, errorString){ throwApiError(errorString, state) },
    }
    try {
      await co(aboutFunc.update.apply(tempParamet))
      expect(true).toEqual(false)
    } catch (err) {
      expect(err.message).toEqual('The request should be json')
    }
  })

  it('[unit] request have not provid license_key, it should be return error and "license should be provided" ', async () => {
    let tempParamet = {
      ...parameters,
      'request': {
        'type': 'application/json',
        'body':{
          'license_key':'',
        },
      },
      'is': function(){ return true},
    }
    await co(aboutFunc.update.apply(tempParamet))
    expect('license should be provided').toEqual(tempParamet.body)
  })

  it('[unit] it have not right license key, it should be return error and "license content is incorrect, cannot update the license."" ', async () => {
    const expectStatus = 400
    let tempParamet = {
      ...parameters,
      'request': {
        'type': 'application/json',
        'body':{
          'license_key':'license_key',
        },
      },
      'is': function(){ return true},
      models:{
        updateLicenses: jest.fn(
          function* updateLicenses() {
            throw Error('mock error')
          }
        ),
      },
    }
    const genThis = function () {
      return tempParamet
    }
    const Mock = jest.fn().mockImplementation(genThis)
    const mock = new Mock()
    await co(aboutFunc.update.apply(mock))
    expect('license content is incorrect, cannot update the license.').toEqual(mock.body)
    expect(mock.status).toEqual(expectStatus)
  })

  // -----------------------------------------------------------------------------
  it('[unit] should call the updateLicenses with specific arguments', async () => {
    const mockReturnValue = 'update license successfully'
    let license_key = Licenses.encrypt(JSON.stringify(validLicenseInfo))
    let postBody = { license_key }
    let tempParamet = {
      ...parameters,
      'request': {
        'type': 'application/json',
        'body': postBody,
      },
      'is': function(){ return true},
      models:{
        updateLicenses: jest.fn(
          function* updateLicenses() {
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
    await co(aboutFunc.update.apply(mock))
    expect(mock.models.updateLicenses.mock.calls[0])
      .toEqual([license_key])
  })

  it('[unit] it have license key, it should be return "update license successfully"', async () => {
    const mockReturnValue = 'update license successfully'
    let license_key = Licenses.encrypt(JSON.stringify(validLicenseInfo))
    let postBody = { license_key }
    let tempParamet = {
      ...parameters,
      'request': {
        'type': 'application/json',
        'body': postBody,
      },
      'is': function(){ return true},
      models:{
        updateLicenses: jest.fn(
          function* updateLicenses() {
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
    await co(aboutFunc.update.apply(mock))
    expect(mockReturnValue).toEqual(mock.body)
  })

  // -----------------------------------------------------------------------------
  it('[unit] should import About models when this.modules does not exist.', async () => {
    let license_key = Licenses.encrypt(JSON.stringify(validLicenseInfo))
    let postBody = { license_key }
    const tempParamet = {
      ...parameters,
      'request': {
        'type': 'application/json',
        'body': postBody,
      },
      'is': function(){ return true },
    }
    const genThis = function () {
      return tempParamet
    }
    co(aboutFunc.update.apply(genThis())).then(successHandler, errorHnadler)
  })
})

const successHandler = function() {

}
const errorHnadler = function(err) {
  console.warn(err)
}
