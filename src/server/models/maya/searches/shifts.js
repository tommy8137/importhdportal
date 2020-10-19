import { hospitalDB } from 'server/helpers/database'
import Promise from 'bluebird'
import R from 'ramda'
import moment from 'moment'

export default class Shifts {
  static* getShifts() {
    const today = moment().format('YYYY-MM-DD')
    const bed_area = yield hospitalDB.Query('SELECT DISTINCT LEFT(bed_no, 1) AS bed_area FROM tyhd_appointment WHERE app_date = @today', { today })
    const hemarea = R.pluck('bed_area')(bed_area.rows)
    return {
      hemarea,
      shifts : [{ s_id: 1, s_name: '早' }, { s_id: 2, s_name: '午' }, { s_id: 3, s_name: '晚' }],
    }
  }
}
