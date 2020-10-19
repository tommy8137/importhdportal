import co from 'co'
import Protos from 'common/protos'
import About from 'server/models/maya/admins/about'
import { errorCode } from 'server/helpers/api-error-helper'
import { systemDB } from 'server/helpers/database'
import { validLicenseInfo } from 'server/helpers/licenses/license-entries'
import Licenses from 'server/helpers/licenses'

describe('[unit] The getAbout in the About modules', function() {
  // -----------------------------------------------------------------------------
  it('Test DB data is incorrect', async () => {
    const expectError = new Error('get about DB err')
    expectError.code = errorCode.INTERNAL_ERROR
    const backupData = await co(systemDB.Query('SELECT version FROM webportal.version'))
    await co(systemDB.Query('DELETE FROM webportal.version'))
    try {
      await co(About.getAbout())
      expect(false).toEqual(true)
    } catch(e) {
      expect(e).toEqual(expectError)
    } finally {
      const version = backupData.rows[0].version
      await co(systemDB.Query(`INSERT INTO webportal.version (version) VALUES('${version}')`))
    }
  })
  // -----------------------------------------------------------------------------
  it('Test DB data is correct', async () => {
    const result = await co(About.getAbout())
    try {
      Protos.About.response.encode(result).toBuffer()
    } catch (e) {
      expect(e).toBe(result)
    }
  })
})
// -----------------------------------------------------------------------------
describe('[unit] The updateLicenses in the About modules', function() {
  it('Put correct about licenses ', async () => {
    const license_key = Licenses.encrypt(JSON.stringify(validLicenseInfo))
    try {
      await co(About.updateLicenses(license_key))
    } catch (e) {
      expect(e).toEqual(false)
    }
  })

  it('Put incorrect about licenses ', async () => {
    const license_key = 'whatever'
    try {
      await co(About.updateLicenses(license_key))
      expect(false).toEqual(true)
    } catch (e) {
      // console.warn('Expect error - ' + e)
    }
  })
})
