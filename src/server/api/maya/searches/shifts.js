import { getShifts } from 'server/models/maya/searches/shifts'
import Protos from 'common/protos'

export default class Shifts {
  *fetchShift(next) {
    const ctx = this
    const shifts = yield getShifts()
    const shiftsBuffer = Protos.Shift.response.encode(shifts).toBuffer()
    ctx.body = shiftsBuffer
    ctx.type = 'application/octet-stream'
  }
}
