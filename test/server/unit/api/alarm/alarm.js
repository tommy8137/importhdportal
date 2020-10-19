import Alarm from 'server/api/maya/alarm/alarm.js'
import co from 'co'
import Protos from 'common/protos'
import Licenses from 'server/helpers/licenses'
import { validLicenseInfo } from 'server/helpers/licenses/license-entries'
import { throwApiError } from 'server/helpers/api-error-helper'

describe('Alarm api & test fetch function', function() {
  let parameters = this
  const alarmFunc = new Alarm()
  const expectType = 'application/octet-stream'
  const mockReturnValue = [{
    'alarm_phrase': '<alarm_phrase>',
    'alarm_process': '<alarm_process>',
  }, {
    'alarm_phrase': '<alarm_phrase>',
    'alarm_process': '<alarm_process>',
  }]

  const alarmBuffer = Protos.AlarmList.response.encode(mockReturnValue).toBuffer()
  const models = {
    getAlarmList: jest.fn(
      function* getAbout() {
        return mockReturnValue
      }
    ),
  }
  // -----------------------------------------------------------------------------
  // it('[unit] should return the alarm', async () => {
  //   const tempParamet = {
  //     ...parameters,
  //     models,
  //   }
  //   const genThis = function () {
  //     return tempParamet
  //   }
  //   const Mock = jest.fn().mockImplementation(genThis)
  //   const mock = new Mock()
  //   await co(alarmFunc.fetchList.apply(mock))
  //   expect(mock.body).toEqual(alarmBuffer)
  //   expect(mock.type).toEqual(expectType)
  // })
  // -----------------------------------------------------------------------------
  it('[unit] should import Alarm models when this.modules does not exist.', async () => {
    const tempParamet = {
      ...parameters,
    }
    const genThis = function () {
      return tempParamet
    }
    co(alarmFunc.fetchList.apply(genThis())).then(successHandler, errorHnadler)
  })
})

const successHandler = function() {

}
const errorHnadler = function(err) {
  console.warn(err)
}
