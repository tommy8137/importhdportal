import { getShifts } from 'server/models/maya/searches/shifts'
import co from 'co'

describe('[unit] The default function in the Shift modules', function() {
  it('Just for coverage', async () => {
     const expectData = { shifts: [{ s_id: 1, s_name: '早' }, { s_id: 2, s_name: '午' }, { s_id: 3, s_name: '晚' }] }
     const result  = await co(getShifts())
     expect(result).toHaveProperty('hemarea')
     expect(result.shifts).toEqual(expectData.shifts)
  })
})
