import { select, call } from 'redux-saga/effects'
import { fetchingTask } from 'sagas/fetch'
import R from 'ramda'
import { mapItems } from './components/FormSBP/selector'
import { maxBlood } from 'containers/Risk/selector'
import { isValidate } from 'common/modules/sbp/validator'
import { maybe } from 'maybes'
import TYPES from 'containers/Risk/action-types'
export const mapIndexed = R.addIndex(R.map)
export const filterIndexed = R.addIndex(R.filter)

export const printErrorMsg = (l, errorMsg) => {
  let langErrorMsg
  if (errorMsg && typeof errorMsg === 'string' && typeof l === 'function') {
    langErrorMsg = l('Value must between %s to %s').replace(/(.*)(%s)(.*)(%s)(.*)/i,
      (match, p1, p2, p3, p4, p5) => {
        const boundary = errorMsg.split(',')
        return (p1 + boundary[0] + p3 + boundary[1] + p5)
      }
    )
  }
  return langErrorMsg
}

export const accessResTag = (resTag) => R.propOr([], resTag)

export const makePredictResultsWithTimes = (resTag, sbps) => R.compose(
  mapIndexed((res, idx) => ({ time: parseInt(sbps.getIn([idx, 'time'])), res })),
  mapIndexed(accessResTag(resTag))
)

export const makePredictionIntervals = (endTime) => R.reduceRight((prediction, reduced) => {
  const { endTime, intervals } = reduced
  const startTime = prediction.time
  const currentInterval = prediction.res
    .map((r, idx) => ({ time: startTime + idx * 60 * 1000, ...r }))
    .filter((r, idx) => r.time <= endTime)

  return {
    endTime: maybe(prediction)
      .filter(p => p.res.length > 0)
      .map(R.propOr(endTime, 'time'))
      .orJust(endTime),
    intervals: R.concat(currentInterval, intervals),
  }
}, { endTime, intervals: [] })

export const makePredictions_ = (endTime, makeResults) => R.compose(
  R.propOr([], 'intervals'),
  makePredictionIntervals(endTime),
  makeResults
)

const validateAndPredict = R.curry(
  (predictApi, data) => R.cond([
    [isValidate(false), (data) => predictApi(data)],  // if validate is true, execute predict
    [R.T, data => isValidate(false)(data)],           // if fail, return false
  ])(data)
)

const status = [TYPES.RISK_PREDICT_REQUEST, TYPES.RISK_PREDICT_SUCCESS, TYPES.RISK_PREDICT_FAILED]
const fetchPrediction = (fetchObject) =>
  maybe(fetchObject)
    .filter(fo => !!fo)
    .map(fo => call(fetchingTask, { status, showLoading: false }, fo))
    .orJust(null)

// types of dia_flow & blood_flow are integer!!
const parseIntIfNeeded = R.curry((key, value) => R.cond([
  [R.equals('dia_flow'), R.always(parseInt(value))],
  [R.equals('blood_flow'), R.always(parseInt(value))],
  [R.T, R.always(value)]
])(key))

const generatePredictParameters = R.curry((basicData, itemData, time) =>
  Object.keys(itemData).reduce((parameters, dataKey) => {
    // skip ns workaround....
    if (dataKey == 'ns') {
      return parameters
    }
    parameters[dataKey] = maybe(itemData[dataKey])
      .map(data => data.filter(d => d.get('time') == time))
      .filter(data => data.size === 1)
      .map(data => data.first())
      .map(datum => datum.get('value'))
      .map(parseIntIfNeeded(dataKey))
      .orJust(undefined)
    return parameters
  }, { ...basicData })
)

export function* makePredictionTasks(predictionApi, basicData = {}) {
  const patient = yield select(state => state.patient)
  const record = yield select(state => state.patient.get('record'))
  const items = record.getIn(['detail', 'entities', 'items'])
  const result = record.getIn(['detail', 'result'])
  const dataSbp = items.getIn([maxBlood, 'data'])
  const itemData = mapItems(items)
  const generateParameters = generatePredictParameters(basicData, itemData)
  const apiFetchObject = validateAndPredict(predictionApi)

  return maybe(dataSbp)
    .map(sbp => sbp.toJS())
    .map(sbp => sbp.map(d =>
      R.compose(
        fetchPrediction,
        apiFetchObject,
        generateParameters
      )(d.time)))
    .orJust([])
}

export const hasDisease = R.curry((diseases, diseaseName) =>
  maybe(diseases)
    .map(ds => ds.filter(d => d.get('d_id') === diseaseName))
    .filter(ds => ds.size >= 1)
    .map(ds => 1)
    .orJust(0)
)

const notEmpty = R.complement(R.isEmpty)
const notNaN = R.complement(R.identical(NaN))

export const normalizeInt = (value) => maybe(value)
  .filter(notEmpty)
  .map(value => parseInt(value.substr(0, 10)))
  .filter(notNaN)
  .orJust(value)

export const normalizeFloat = (value) => maybe(value)
  .filter(notEmpty)
  .map(value => value.substr(0, 10))
  .map(value => {
    let floatValue = value.toString().match(/^-?\d+(?:\.\d{0,5})?/)
    return floatValue ? floatValue[0] : value
  })
  .filter(notNaN)
  .orJust(value)
