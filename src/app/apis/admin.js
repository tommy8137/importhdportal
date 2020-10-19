import fetchObject from '../utils/fetch'
import Protos from 'common/protos'

const { About: aboutProto, Setting: settingProto, ThresholdSetting: thresholdsettingProto } = Protos

/**
 * information about license key
 * @return {[type]} [description]
 */
export function about() {
  const url = `/api/${__API_VERSION__}/admins/about`
  const options = {
    headers: {
      'Content-Type': 'application/octet-stream',
    },
    transform: aboutProto.response.transform,
    method: 'get',
  }

  return fetchObject(url, options)
}

export function getSetting() {
  const url = `/api/${__API_VERSION__}/admins/settings`
  const options = {
    headers: {
      'Content-Type': 'application/octet-stream',
    },
    transform: settingProto.response.transform,
    method: 'get',
  }

  return fetchObject(url, options)
}

export function setUserTimeout(timeout) {
  const url = `/api/${__API_VERSION__}/admins/settings`
  const options = {
    headers: {
      'Content-Type': 'application/octet-stream',
    },
    body: settingProto.request.transform({ timeout_minute: timeout }),
    transform: settingProto.response.transform,
    method: 'put',
  }

  return fetchObject(url, options)
}

export function getThresholdSetting() {
  const url = `/api/${__API_VERSION__}/admins/thresholdsetting`
  const options = {
    headers: {
      'Content-Type': 'application/octet-stream',
    },
    transform: thresholdsettingProto.response.transform,
    method: 'get',
  }

  return fetchObject(url, options)
}

export function setThresholdSetting(ThresholdStatus) {
  let req = { status: ThresholdStatus.status, max_threshold: ThresholdStatus.max_threshold, min_threshold: ThresholdStatus.min_threshold }
  const url = `/api/${__API_VERSION__}/admins/thresholdsetting`
  const options = {
    headers: {
      'Content-Type': 'application/octet-stream',
    },
    body: thresholdsettingProto.request.transform(req),
    transform: thresholdsettingProto.response.transform,
    method: 'put',
  }

  return fetchObject(url, options)
}