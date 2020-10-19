import Promise from 'bluebird'
import { errorCode, throwApiError } from 'server/helpers/api-error-helper'
import fs from 'fs'
import { systemDB } from 'server/helpers/database/'
import Licenses from 'server/helpers/licenses'
import moment from 'moment'

const { licenseFilePath } = global.config

export default class About {
  static getAbout() {
    return Promise.try(function() {
      return systemDB.Query('SELECT version FROM webportal.version')
    }).then(function(result){
      if (result.rowCount === 0) {
        throwApiError('get about DB err', errorCode.INTERNAL_ERROR)
      } else {
        const { activeTime, duration, licenseCode } = Licenses.getLicense()
        const about = {
          version: result.rows[0].version,
          license_key: licenseCode,
          valid_date: String(moment(activeTime).add(Number(duration), 'days').format()),
        }

        return about
      }
    })
  }

  static updateLicenses(encryptedLicense) {
    return Promise.try(() => {
      Licenses.updateLicense(encryptedLicense)
      return true
    })
  }
}
