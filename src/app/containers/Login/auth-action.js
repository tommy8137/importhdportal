import { SAGA_FETCH_ACTION } from 'app/utils/fetch'
import TYPES from 'constants/action-types'
import { login as loginApi, logout as logoutApi, setAgreement as setAgreementApi } from 'app/apis/auth'
import loginFlow from './saga'

export function login(username, password) {
  return {
    type: TYPES.SAGA_FETCH_ACTION,
    status: [],
    fetch: { customTask: loginFlow(username, password) }
  }
}

export function logout() {
  const fetch = logoutApi()
  const status = [TYPES.LOGOUT_REQUESTING, TYPES.LOGOUT_SUCCESS, TYPES.LOGOUT_FAILED]
  return { fetch, status, type: TYPES.SAGA_FETCH_ACTION }
}
