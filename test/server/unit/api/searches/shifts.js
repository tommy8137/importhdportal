import Protos from 'common/protos'
import co from 'co'
import Shifts from 'server/api/maya/searches/shifts.js'
import { getShifts }  from 'server/models/maya/searches/shifts.js'

describe('[unit] The shifts functions in the Shifts modules', () => {
  it('should return the shifts from getShifts function', async () => {
    const shiftsObj = new Shifts()
    const shifts = await co(getShifts())
    const shiftsBuffer = Protos.Shift.response.encode(shifts).toBuffer()
    const spyThis = {}
    const expectType = 'application/octet-stream'
    await co(shiftsObj.fetchShift.apply(spyThis))
    expect(spyThis.body).toEqual(shiftsBuffer)
    expect(spyThis.type).toEqual(expectType)
  })
})
