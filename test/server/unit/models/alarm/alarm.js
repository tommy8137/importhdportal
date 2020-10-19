import co from 'co'
import Alarm from 'server/models/maya/alarm/alarm'
import { errorCode } from 'server/helpers/api-error-helper'
import { systemDB } from 'server/helpers/database'
import { validLicenseInfo } from 'server/helpers/licenses/license-entries'
import Licenses from 'server/helpers/licenses'
import Protos from 'common/protos'
describe('[unit] The get alarm  in the Alarm modules', function() {
  // -----------------------------------------------------------------------------
  it('Test DB data is correct', async () => {
    const result = await co(Alarm.getAlarmList())
    try {
      Protos.AlarmList.response.encode(result).toBuffer()
    } catch (e) {
      expect(e).toBe(result)
    }
  })
})
