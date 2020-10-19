import TYPES from 'constants/action-types'
import ST from './action-types'

import { getSetting as getSettingApi, setUserTimeout as setUserTimeoutApi, getThresholdSetting as getThresholdSettingApi, setThresholdSetting as setThresholdSettingApi  } from 'app/apis/admin'

export function logs() {
  return {
    type: ST.ADMIN_GET_LOGS
  }
}

export function setUserTimeout(timeout) {
  const status = [ST.ADMIN_SET_TIMEOUT_REQUEST, ST.ADMIN_SET_TIMEOUT_SUCCESS, ST.ADMIN_SET_TIMEOUT_FAILED]
  const fetch = setUserTimeoutApi(timeout)
  return {
    type: TYPES.SAGA_FETCH_ACTION,
    status,
    fetch,
  }
}

export function getSetting() {
  const status = [ST.ADMIN_GET_SETTING_REQUEST, ST.ADMIN_GET_SETTING_SUCCESS, ST.ADMIN_GET_SETTING_FAILED]
  const fetch = getSettingApi()
  return {
    type: TYPES.SAGA_FETCH_ACTION,
    status,
    fetch,
  }
}

export function getThresholdSetting() {
  const status = [ST.ADMIN_GET_THRESHOLD_SETTING_REQUEST, ST.ADMIN_GET_THRESHOLD_SETTING_SUCCESS, ST.ADMIN_GET_THRESHOLD_SETTING_FAILED]
  const fetch = getThresholdSettingApi()
  return {
    type: TYPES.SAGA_FETCH_ACTION,
    status,
    fetch,
  }
}

export function setThresholdSetting(ThresholdStatus) {
  const status = [ST.ADMIN_SET_THRESHOLD_SETTING_REQUEST, ST.ADMIN_SET_THRESHOLD_SETTING_SUCCESS, ST.ADMIN_SET_THRESHOLD_SETTING_FAILED]
  const fetch = setThresholdSettingApi(ThresholdStatus)
  return {
    type: TYPES.SAGA_FETCH_ACTION,
    status,
    fetch,
  }
}