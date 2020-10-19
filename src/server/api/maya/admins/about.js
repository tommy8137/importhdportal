import AboutModel from 'server/models/maya/admins/about'
import Protos from 'common/protos'
import getRawBody from 'raw-body'
import { errorCode, throwApiError } from 'server/helpers/api-error-helper'

export default class About {

  *fetch() {
    this.models = this.models || AboutModel
    const ctx = this
    const about = yield this.models.getAbout()
    const aboutBuffer = Protos.About.response.encode(about).toBuffer()
    ctx.body = aboutBuffer
    ctx.type = 'application/octet-stream'
  }

  *update() {
    this.models = this.models || AboutModel
    const ctx = this
    if (!ctx.is('application/json')) {
      ctx.throw(415, 'The request should be json');
    }
    const { license_key } = ctx.request.body
    if (!license_key) {
      ctx.status = 400
      ctx.body = 'license should be provided'
      return
    }
    try {
      const updatedLicense = yield this.models.updateLicenses(license_key)
      ctx.body = 'update license successfully'
    } catch (ex) {
      console.error(ex)
      ctx.status = 400
      ctx.body = 'license content is incorrect, cannot update the license.'
    }
  }
}
