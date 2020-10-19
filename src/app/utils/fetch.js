import originalFetch from 'isomorphic-fetch'
import merge from 'lodash.merge'
import CONSTANTS from 'constants'
import TYPES from 'constants/action-types'
import CacheHelper from '../helpers/cache-helper.js'

const { KEY_REFRESH_TOKEN } = CONSTANTS
const { SAGA_FETCH_ACTION, SAGA_PRELOAD_ACTION, REFRESH_TOKEN_DONE } = TYPES
const { REFRESH_TOKEN_URL } = CONSTANTS

export const DEFAULT_OPTIONS = { credentials: 'same-origin', headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' } }

export const canUseDOM = !!(
  (typeof window !== 'undefined' &&
  window.document && window.document.createElement)
)

export function logout() {
  const url = '/api/logout-v1beta'
  const options = { method: 'post', refreshOnce: false }
  return fetchObj(url, options)
}

export function fetchStatus() {
  const url = '/api/status'
  const options = { method: 'get' }
  return fetchObj(url, options)
}

/**
 * return a fetching object, arguments are set the same as the offical fetch: url and options
 * @param  {[type]}    url                 url to be visited, localhost limited
 * @param  {Boolean}   options.refreshOnce use this flag to determine to refresh the token or not if 401 returned
 * @param  {...[type]} options.options     the original fetching options
 * @return {[type]}                        [description]
 */
export default function fetchObj(url, config = {}) {
  let { refreshOnce = true, transform = 'json', ...options} = config
  if (!__CLIENT__) {
    url = `https://${__HOST__}:${__PORT__}${url}`
    const https = require('https')
    const agent = new https.Agent({
      rejectUnauthorized: false,
    })
    options = { ...options, transform, agent }
  } else {
    // add cookies:
    // https://github.com/github/fetch#sending-cookies
    options = merge({}, DEFAULT_OPTIONS, { refreshOnce, transform }, options)
  }
  return { url, options }
}

/**
 * the real fetch method
 * @param  {[type]}    url             url to be visited
 * @param  {...[type]} options.options fetching options
 * @param  {[type]}    options.token   if provided, it will be injected as Authorization Bearer of Header
 * @param  {[type]}    options.refreshOnce   should fetch need to refresh the token once while the response of 401,
 *                                           refreshing should not be done here
 * @return {[type]}                    the fetching promise
 */
export function fetch(url, { token, refreshOnce, transform = 'json', ...options }) {
  if (typeof token === 'string' && token.trim() !== '') {
    options = merge({}, { headers: { Authorization: `Bearer ${token}` } }, options)
  }
  if (canUseDOM && methodIsGET(options.method)) {
    options.headers = merge({}, options.headers, { 'if-none-match': CacheHelper.getEtag(url) })
  }

  const promise = originalFetch(url, options)
    .then(response => {
      if (response.status >= 200 && response.status < 300) {
        return response
      } else if (response.status == 304) {
        return response
      } else {
        const error = new Error(response.statusText)
        error.status = response.status
        error.response = response
        throw error
      }
    })
    .catch(err => {
      // console.log('catch err ', err)
      return errorTransform(err, 'text')
    })

  const transformFunc = (typeof transform === 'string')
    ? (result) => result[transform]()
    : typeof transform === 'function'
    ? transform
    : (result) => result

  let etag
  let responseStatus

  return promise
    .then(response => { // 1. record the etag & status
      etag = response.status == 200
      ? response.headers.get('etag')
      : null
      responseStatus = response.status
      return response
    })
    .then(response => { // 2. use cache if possible

      if (canUseDOM && response.status === 304) {
        const cached = CacheHelper.getCache(url)
        return cached? cached: transformFunc(response)
      } else {
        return transformFunc(response)
      }
    })
    .then(result => {
      if (canUseDOM && methodIsGET(options.method) && responseStatus == 200 && etag) {
        CacheHelper.saveCache(url, etag, result)
        return result
      }
      return result
    })
}

const methodIsGET = (method) => (typeof method === 'undefined' || /get/i.test(method) === true)

/**
 * handle the returned error of requesting promise. will try to resolve the error message
 * @param  {[type]} res       [description]
 * @param  {String} transform might be 'string' or 'json' currently
 * @return {[type]}           [description]
 */
function errorTransform(error = 'unknown error', transform = 'json') {
  if (error.response && typeof error.response[transform] !== 'function') {
    const res = error.response
    const err = new Error(res.statusText)
    err.response = res
    err.status = res.status
    throw err
  } else if (!error.response) {
    throw error
  } else {
    return error.response[transform]().then(t => {
      const err = new Error(t)
      const res = error.response
      err.response = res
      err.status = res.status
      throw err
    })
  }
}
