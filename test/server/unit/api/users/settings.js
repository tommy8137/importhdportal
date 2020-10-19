import Settings from 'server/api/maya/users/settings.js'
import co from 'co'
import Protos from 'common/protos'

describe('Settings api & test fetch function', function() {
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
  const settingsFunc = new Settings()
  const expectType = 'application/octet-stream'
  const mockReturnValue =   {
    'timeout_minute': 1,
  }
  const settingsBuffer = Protos.Setting.response.encode(mockReturnValue).toBuffer()
  const models = {
    getSettings: jest.fn(
      function* getSettings() {
        return mockReturnValue
      }
    ),
  }
  // -----------------------------------------------------------------------------
  it('[unit] should call the getSettings with specific arguments', async () => {
    let tempParamet = {
      ...parameters,
      models,
    }
    const genThis = function () {
      return tempParamet
    }
    const Mock = jest.fn().mockImplementation(genThis)
    const mock = new Mock()
    await co(settingsFunc.fetch.apply(mock))
    expect(mock.models.getSettings.mock.calls[0])
      .toEqual([tempParamet.state.user.id])
  })
  // -----------------------------------------------------------------------------
  it('[unit] should return the setting', async () => {
    const tempParamet = {
      ...parameters,
      models,
    }
    const genThis = function () {
      return tempParamet
    }
    const Mock = jest.fn().mockImplementation(genThis)
    const mock = new Mock()
    await co(function* (){
      yield settingsFunc.fetch.apply(mock)
    })
    expect(mock.body).toEqual(settingsBuffer)
    expect(mock.type).toEqual(expectType)
  })
  // -----------------------------------------------------------------------------
  it('[unit] should import SettingsModel models when this.models does not exist.', async () => {
    const tempParamet = {
      ...parameters,
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
