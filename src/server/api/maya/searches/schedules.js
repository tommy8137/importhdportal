import Schedule from 'server/models/maya/searches/schedules'
import Protos from 'common/protos'
import { validateDateFormat, validateDateRange } from 'server/utils/api-validate-parameter'

export default class Schedules {
  *list(next) {
    this.models = this.models || Schedule
    const ctx = this
    const startDate = ctx.query.start_date
    const endDate = ctx.query.end_date
    const offset = ctx.query.offset
    const limit = ctx.query.limit
    const sort = ctx.query.sort
    const q = ctx.query.q

    validateDateFormat(startDate, endDate)
    validateDateRange(startDate, endDate)

    if (offset < 0) {
      throw {
        name: 'Error',
        message: 'The offset parameter should not be negative number'
      }
    }

    const scheduleList
      = yield this.models.getSchedules(startDate, endDate, offset, limit, sort, q)
    const schedulesBuffer = Protos.Schedule.response.encode(scheduleList).toBuffer()
    ctx.body = schedulesBuffer
    ctx.type = 'application/octet-stream'
  }
}
