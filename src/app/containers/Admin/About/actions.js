import { about as aboutApi } from 'app/apis/admin'
import AT from './action-types'
import TYPES from 'constants/action-types'

export function about() {
  const status = [AT.ADMIN_ABOUT_REQUEST, AT.ADMIN_ABOUT_SUCCESS, AT.ADMIN_ABOUT_FAILED]
  const fetch = aboutApi()
  return {
    type: TYPES.SAGA_FETCH_ACTION,
    status,
    fetch,
  }
}
