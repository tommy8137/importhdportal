import { errorCode, throwApiError } from 'server/helpers/api-error-helper'
import Licenses from 'server/helpers/licenses'

export default function *(next) {
  if(!Licenses.checkLicense()) {
    throwApiError('License has expired. Please contact with administrator.', errorCode.LICENSE_EXPIRED)
  }
  yield next
}
