import Protos from 'common/protos'
import co from 'co'
import Agreements from 'server/models/maya/users/agreements'
import { systemDB } from 'server/helpers/database/'


beforeAll(async function() {
  await co(systemDB.Query(`INSERT INTO webportal.user (doctor_id,timeout_minute,always_show) values ('whatever', 1, 1)`))
})

afterAll(async function() {
  await co(systemDB.Query(`DELETE FROM webportal.user WHERE doctor_id = 'whatever' `))
})
// the setting in maya webportal which is disable, so there is not necessary to test.
describe('[unit] The getAgreements in the Agreements models', function() {
  it('Test get exist doctor.', async () => {
    const result = await co(Agreements.getAgreements('mis'))
    Protos.Agreement.response.encode(result).toBuffer()
  })
  // -----------------------------------------------------------------------------
  it('Test get un-exist doctor.', async () => {
    const doctor_id = 'unittest'
    const result = await co(Agreements.getAgreements(doctor_id))
    Protos.Agreement.response.encode(result).toBuffer()
    await co(systemDB.Query(`DELETE FROM webportal.user
                              WHERE doctor_id = $1
                           `, [doctor_id]))
  })

  it('The multi calls get agreements at same time.', async () => {
    const results = await co(function *(){
      // resolve multiple promises in parallel
      const result1 = co(Agreements.updateAgreements('whatever', { always_show : 1 }))
      const result2 = co(Agreements.updateAgreements('whatever', { always_show : 1 }))
      const result3 = co(Agreements.updateAgreements('whatever', { always_show : 1 }))
      const result4 = co(Agreements.updateAgreements('whatever', { always_show : 1 }))
      const results = yield [result1, result2, result3, result4]
      return results

    })
    try {
      for (let res of results) {
        Protos.Agreement.response.encode(res).toBuffer()
      }
    } catch(e) {
        expect(true).toBe(e)
    }
  })
})

describe('[unit] The updateAgreements in the Agreements models', function() {
  it('Test update success.', async () => {
    const result = await co(Agreements.updateAgreements('whatever', { always_show : 1 }))
    Protos.Agreement.response.encode(result).toBuffer()
  })
})
