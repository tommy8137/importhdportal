import Promise from 'bluebird'
import { systemDB } from 'server/helpers/database/'

export default class Agree {
  static getAgreements(doctorId) {
    return Promise.try(function() {
      return systemDB.Query('SELECT always_show \
                       FROM webportal.user \
                       WHERE doctor_id = $1', [doctorId])
    }).then(function(result) {
      if (result.rowCount === 0) {
        return systemDB.Query(`
          WITH tmp_value (doctor_id, timeout_minute, always_show) as (
           values
            ($1, 20::int4, 2::int4)
          )
          INSERT INTO webportal.user(doctor_id, timeout_minute, always_show)
          SELECT doctor_id, timeout_minute, always_show FROM tmp_value
          WHERE doctor_id NOT IN (SELECT doctor_id FROM webportal.user WHERE doctor_id = $1) `, [doctorId])
      }
    }).then(function(result) {
      return systemDB.Query('SELECT always_show \
                             FROM webportal.user \
                             WHERE doctor_id = $1', [doctorId])
    }).then(function(result) {
      return { always_show: result.rows[0].always_show }
    })
  }

  static updateAgreements(doctorId, updateAgreements) {
    return Promise.try(function() {
      return systemDB.Query('UPDATE webportal.user \
                             SET always_show = $2 \
                             WHERE doctor_id = $1', [doctorId, updateAgreements.always_show])
    }).then(function(result) {
      if (result.rowCount == 1) {
        return systemDB.Query('SELECT always_show \
                               FROM webportal.user \
                               WHERE doctor_id = $1', [doctorId])
      }
    }).then(function(result) {
      return { always_show: result.rows[0].always_show }
    })
  }
}
