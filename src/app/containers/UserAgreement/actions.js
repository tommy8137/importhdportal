import TYPES from 'constants/action-types'
import UT from './action-types'
import { setAgreement as setAgreementApi } from 'app/apis/auth'

export function userAgree(alwaysShow) {
  if (alwaysShow) {
    return { type: UT.USER_AGREEMENT_SUCCESS }
  } else {
    const fetch = setAgreementApi(1)
    const status = [UT.USER_AGREEMENT_REQUEST, UT.USER_AGREEMENT_SUCCESS, UT.USER_AGREEMENT_FAILED]
    return { fetch, status, type: TYPES.SAGA_FETCH_ACTION }
  }
}
