import moment from 'moment'
import { errorCode, throwApiError } from 'server/helpers/api-error-helper'

export const validateDateFormat  = (startDate, endDate) => {
  const IS_STRICT_PARSING = true
  if (!moment(startDate, 'YYYY-MM-DD', IS_STRICT_PARSING).isValid()) {
    throwApiError('The startDate format should be YYYY-MM-DD', errorCode.ACCESS_DENY)
  } else if(!moment(endDate, 'YYYY-MM-DD', IS_STRICT_PARSING).isValid()) {
    throwApiError('The endDate format should be YYYY-MM-DD', errorCode.ACCESS_DENY)
  }
}

export const validateDateRange = (startDate, endDate) => {
  const day = moment().add(-6, 'month')
  if (moment(day).diff(moment(startDate), 'days', false) > 0 || endDate < startDate || endDate > moment().format('YYYY-MM-DD')) {
    throwApiError('The start_date/end_date range is invaild', errorCode.ACCESS_DENY)
  }
}
