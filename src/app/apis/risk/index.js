import fetchObject from 'app/utils/fetch'
import { normalize, arrayOf } from 'normalizr'
import { LibItem } from 'app/schemas/risks'
import {
  Libs as libsProto,
  BPVar as bpVarProto,
  BPProb as bpProbProto,
  BPEstimation as bpEstimationProto,
  PersonalThreshold as personalThresholdProto,
  SetPersonalThreshold as setPersonalThresholdProto,
} from 'common/protos'
import { categoryId as sbpVariationCId, moduleId as sbpVariationMId } from 'containers/Risk/Modules/Sbp/Range'
import { categoryId as sbpProbabilityCId, moduleId as sbpProbabilityMId } from 'containers/Risk/Modules/Sbp/Probability'
import { categoryId as sbpEstimationCId, moduleId as sbpEstimationMId } from 'containers/Risk/Modules/Sbp/Estimation'
import { maybe } from 'maybes'

export function getLibs() {
  const url = `/api/${__API_VERSION__}/risks/libs`
  const options = {
    headers: {
      'Content-Type': 'application/octet-stream',
    },
    method: 'get',
    transform: async (res) => {
      const resData = await libsProto.response.transform(res)
      const rawData = resData.toRaw()
      const normalized = normalize(rawData.categories, arrayOf(LibItem))
      return normalized
    }
  }

  return fetchObject(url, options)
}

export function postRiskChart(cId, mId, data) {
  const transforms = {
    [sbpVariationMId]: bpVarProto.response.transform,
    [sbpProbabilityMId]: bpProbProto.response.transform,
    [sbpEstimationMId]: bpEstimationProto.response.transform,
  }

  if (!cId || !mId) {
    throw new Error(`c_id or m_id is unavailable: ${cId}:${mId}`)
  }
  const url = `/api/${__API_VERSION__}/risks/categories/${cId}/modules/${mId}/charts`
  const transform = maybe(transforms[mId]).orJust(res => res)
  const options = {
    headers: {
      'Content-Type': 'application/octet-stream',
    },
    method: 'post',
    body: data,
    transform,
  }

  return fetchObject(url, options)
}

// https://gitlab.mrd3.openlab.tw/wiprognosis/web-portal/blob/develop/api.md#11-risks-access
export function accessRiskChart(cId, mId, time, pId, rId) {
  if (!cId || !mId || !time || !pId || !rId) {
    throw 'missing argument for the api of accessing risk chart'
  }
  const url = `/api/${__API_VERSION__}/risks/categories/${cId}/modules/${mId}/access?time=${time}&p_id=${pId}&r_id=${rId}`
  const options = {
    transform: res => res,
  }
  return fetchObject(url, options)
}

export function getSystemThreshold(rId) {
  if (!rId) {
    throw 'missing argument for the api of accessing risk getSystemThreshold'
  }
  const url = `/api/${__API_VERSION__}/risks/systemthreshold/${rId}`
  const options = {
    headers: {
      'Content-Type': 'application/octet-stream',
    },
    transform: personalThresholdProto.response.transform,
    method: 'get',
  }

  return fetchObject(url, options)
}

export function setPersonalThreshold(r_id, setting_threshold) {
  if (!r_id || !setting_threshold) {
    throw 'missing argument for the api of accessing risk updatePersonalThreshold'
  }
  let req = { r_id, setting_threshold }
  const url = `/api/${__API_VERSION__}/risks/setpersonalthreshold`
  const options = {
    headers: {
      'Content-Type': 'application/octet-stream',
    },
    body: setPersonalThresholdProto.request.transform(req),
    transform: setPersonalThresholdProto.response.transform,
    method: 'put',
  }

  return fetchObject(url, options)
}