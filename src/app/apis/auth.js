import fetchObject from '../utils/fetch'
import Protos from 'common/protos'
const { Agreement: agreementProto, Setting: settingProto } = Protos

export function login(username, password) {
  const url = `/api/${__API_VERSION__}/auth/login`
  const options = { method: 'post', body: JSON.stringify({ username, password }), refreshOnce: false }
  return fetchObject(url, options)
}

export function logout() {
  const url = `/api/${__API_VERSION__}/auth/logout-v1beta`
  const options = { method: 'post', refreshOnce: false }
  return fetchObject(url, options)
}

export function getTimeout() {
  const url = `/api/${__API_VERSION__}/users/settings`
  const options = {
    method: 'get',
    transform: settingProto.response.transform,
  }
  return fetchObject(url, options)
}

export function getAgreement() {
  const url = `/api/${__API_VERSION__}/users/agreements`
  const options = {
    method: 'get',
    transform: agreementProto.response.transform,
  }
  return fetchObject(url, options)
}

export function setAgreement(agreements) {
  const url = `/api/${__API_VERSION__}/users/agreements`
  const options = {
    method: 'put',
    headers: {
      'Content-Type': 'application/octet-stream',
    },
    body: agreementProto.request.transform({ always_show: agreements }),
    transform: agreementProto.response.transform,
  }
  return fetchObject(url, options)
}
