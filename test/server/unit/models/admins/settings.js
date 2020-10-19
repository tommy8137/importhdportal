import Protos from 'common/protos'
import co from 'co'
import Settings from 'server/models/maya/admins/settings'
import { systemDB } from 'server/helpers/database/'

// the setting in maya webportal which is disable, so there is not necessary to test.
describe('[unit] The getSettings in the Settings models', function() {
  // -----------------------------------------------------------------------------
  it('Test have mis data in webportal.user.', async () => {
    await co(systemDB.Query(`INSERT INTO webportal.user (doctor_id, timeout_minute, always_show)
                              VALUES ('mis_id', '1', '1')
                           `))
    const result = await co(Settings.getSettings())
    Protos.Setting.response.encode(result).toBuffer()
    await co(systemDB.Query(`DELETE FROM webportal.user
                              WHERE doctor_id = $1
                           `, ['mis_id']))
  })
  // -----------------------------------------------------------------------------
  it(`Test couldn't found 'mis' data in webportal.user.`, async () => {
    const result = await co(Settings.getSettings())
    Protos.Setting.response.encode(result).toBuffer()
  })
})

describe('[unit] The updateSettings in the Settings models', function() {
  // -----------------------------------------------------------------------------
  it('Test update success.', async () => {
    const result = await co(Settings.updateSettings('whatever', { timeout_minute : 20 }))
    Protos.Setting.response.encode(result).toBuffer()
  })
  // -----------------------------------------------------------------------------
  it(`Test update failure when the doctor_id is incorrect.`, async () => {
    const result = await co(Settings.updateSettings('9527test', { timeout_minute : 20 }))
    Protos.Setting.response.encode(result).toBuffer()
  })
})
