import { createSelector } from 'reselect'
import { localeSelector } from 'reducers/locale-reducer'
import { safeGetModuleState, globalConfigsSelector } from 'containers/Risk/selector'
import { moduleId } from './reducer'
import { chartRangeSelector } from 'containers/Record/selector'
import { fieldNames, mapItems } from '../components/FormSBP/selector'
import simulatorSelector from '../components/Simulator/selector'
import R from 'ramda'
import { maybe } from 'maybes'
import { hasDisease } from '../utils'
import { fromJS } from 'immutable'
import { alarmSelector } from './components/AlarmHandler'
import { categoryModuleSelector, libsSelector } from 'containers/Risk/selector'
import { isValidate } from 'common/modules/sbp/validator'

const mergeAll = (...objs) => R.mergeAll(objs)

const fieldKeys = Object.keys(fieldNames)
const nullPoint = fieldKeys.reduce((ret, fn) => {
  ret[fn] = '─'
  return ret
}, { time: 0 })

const lastMaybe = R.compose(
  maybe,
  R.last
)

// summary data based on sbp: [ { time, sbpvalue, conductivity, ... }, ... ]
const getItemDataAtTime = R.curry((time, item) => maybe(item)
  .flatMap(item => maybe(item.get('data')))
  .map(data => data.filter(datum => datum.get('time') == time))
  .filter(data => data.size > 0)
  .map(data => data.first())
  .orJust(null)
)
export const sbpDataSelector = createSelector(
  (state) => state.patient.getIn(['record', 'detail', 'entities', 'items']),
  (items) => {
    const sbpTimes = maybe(items)
      .flatMap(items => maybe(items.getIn(['sbp', 'data'])))
      .map(sbp => sbp.map(datum => datum.get('time')))
      .map(times => times.map(time => parseInt(time)))
      .map(times => times.sort((time1, time2) => time1 - time2))
      .map(sbp => sbp.toJS())
      .orJust([])

    return sbpTimes.map(time => maybe(items)
      .map(items => {
        const getItemData = getItemDataAtTime(time)
        return items.map(getItemData)
      })
      .map(items => items.filter(item => item))
      .map(items => items.reduce((point, item, key) => {
          point[key] = item.get('value')
          return point
        }, { time })
      )
      // workaround for ns
      .map(point => ({ ns: 0, ...point }))
      .orJust({ time })
    )
  }
)

export const selectedPointSelector = createSelector(
  (state) => state.patient.getIn(['record', 'risk', 'module', 'state', 'selectedTime']),
  (state) => state.patient.getIn(['record', 'detail', 'result', 'dialysateca1']),
  sbpDataSelector,
  (selectedTime, dialysateca1 = '─', sbpData) =>
    maybe(sbpData.filter(datum => datum.time <= selectedTime))
      .filter(sbpData => sbpData.length > 0)
      .map(R.last)
      .map(point => ({ ...point, dialysateca1 }))
      .map(R.pick(fieldKeys.concat(['deltadia_temp_value'])))
      .map(point => mergeAll(nullPoint, point, { time: selectedTime }))
      .orJust(nullPoint)
)

/**
 * provide the default values of fields
 * @param  {[type]} (state) [description]
 * @param  {[type]} (state  [description]
 * @return {[type]}         [description]
 */
const mergeSbp = R.curry((age, gender, diseases, record) => R.compose(
  R.merge({
    age,
    gender,
    dm: hasDisease(diseases, 'dm'),
    temperature: record.get('temperature'),
    dryweight: record.get('dryweight'),
  }),
  R.pick(fieldKeys.concat(['time', 'sbp', 'deltadia_temp_value', 'target_uf', 'delta_bloodflow', 'delta_uf']))
))
export const lastPointSelector = createSelector(
  (state) => state.patient.get('age'),
  (state) => state.patient.get('gender'),
  (state) => state.patient.get('diseases'),
  (state) => state.patient.getIn(['record', 'detail', 'result']),
  sbpDataSelector,
  (age, gender, diseases, record, sbpData) =>
    lastMaybe(sbpData)
      .map(mergeSbp(age, gender, diseases, record))
      .orJust({})
)

export const preDiaTempSelector = createSelector(
  (state) => state.patient.getIn(['record', 'detail', 'entities', 'items', 'pre_dia_temp_value']),
  (preDiaTempList) =>
    lastMaybe(preDiaTempList.get('data').toJS())
    .map(item => item.value)
    .orJust({})
)

export const formDataSelector = createSelector(
  lastPointSelector,
  lastPoint => ({ FormSBP: lastPoint })
)

const reduceFunc = (data) => maybe(data)
  .map(data => data.reduce((reduced, p, idx) => {
    if (idx !== 0) {
      reduced.ub.push({ x: p.get('time'), y: p.get('UB') })
      reduced.ub_ub.push({ x: p.get('time'), y: p.get('UB_UB') })
      reduced.lb.push({ x: p.get('time'), y: p.get('LB') })
      reduced.lb_lb.push({ x: p.get('time'), y: p.get('LB_LB') })
    }
    return reduced
  }, { ub: [], ub_ub: [], lb: [], lb_lb: [] }))
  .orJust(null)

const dataSelector = (type) => createSelector(
  safeGetModuleState(moduleId),
  sbpState =>
    maybe(sbpState)
      .map(state => state.get(type))
      .orJust(null)
)

const simulationSelector = createSelector(
  dataSelector('simulation'),
  (simulation) => reduceFunc(simulation)
)

const predictionsSelector = createSelector(
  dataSelector('predictions'),
  (predictions) => reduceFunc(predictions)
)

export const infoSelector = createSelector(
  (state) => state.patient.getIn(['record', 'detail', 'result', 'r_id']),
  chartRangeSelector,
  safeGetModuleState(moduleId),
  predictionsSelector,
  simulationSelector,
  (recordId, chartRange, sbpState, predictions, simulation) => {
    const defaultInfo = {
      ...chartRange,
      recordId,
      selectedTime: null,
      // remindings: null,
      predictions,
      simulation,
      newArrivals: null,
    }

    return maybe(sbpState)
      .map(state => ({
        ...defaultInfo,
        selectedTime: sbpState.get('selectedTime'),
        // remindings: sbpState.get('remindings'),
        newArrivals: sbpState.get('newArrivals'),
      }))
      .orJust(defaultInfo)
  }
)

// data of green line will be summarized at the saga middleware.
// this is due to waiting for all necessary data fetched (chart, prediction, reminding....)
const getRaw = state => state.get('greenLine').toJS()
const getKey = state => state.get('key')
const makeGreenLine = (key, raw) => ({
  key,
  raw,
  times: raw.map(r => r.time),
  values: raw.map(r => r.value),
  points: raw.map(r =>({ x: r.time, y: r.value })),
})
const mapGreenLine = R.converge(makeGreenLine, [getKey, getRaw])
const getGreenLine = state => maybe(state)
  .map(mapGreenLine)
  .orJust({
    key: null,
    raw: [],
    times: [],
    values: [],
    points: [],
  })
export const greenLineSelector = (moduleId) => createSelector(
  safeGetModuleState(moduleId),
  getGreenLine
)

export const symbolGenerator = R.curry((selectedPoint, newArrivals, point) => {
  const selected = (point.time == selectedPoint.time)
  const isNewArrival = !!(!selected && newArrivals && newArrivals.filter(na => na.get('time') == point.time).size > 0)
  return {
    showNode: selected || isNewArrival,
    showText: selected || isNewArrival,
    isNewArrival,
  }
})

export const sbpAlarmThresholdSelector = createSelector(
  lastPointSelector,
  globalConfigsSelector,
  (lastPoint, globalConfigs) => {
    const lastSBP = lastPoint.sbp
    const MAX_BLOOD_UPPER = globalConfigs.get('maxblood_upper')
    const MAX_BLOOD_LOWER = globalConfigs.get('maxblood_lower')

    // func for get unit and value
    const getMaxBloodTunning = (lastSBP, key) => {
      if (lastSBP < MAX_BLOOD_LOWER) {
        return globalConfigs.getIn(['maxblood_lower_tuning', key])
      } else if (lastSBP >= MAX_BLOOD_LOWER && lastSBP <= MAX_BLOOD_UPPER) {
        return globalConfigs.getIn(['maxblood_middle_tuning', key])
      } else {
        return globalConfigs.getIn(['maxblood_upper_tuning', key])
      }
    }

    // func for calculate threshold
    const getThreshold = (lastSBP, tuningValue, tuningUnit) => {
      if (tuningUnit === '%') {
        return lastSBP * (1 - tuningValue / 100)
      } else {
        return lastSBP - tuningValue
      }
    }

    const tuningUnit = getMaxBloodTunning(lastSBP, 'unit')
    const tuningValue = getMaxBloodTunning(lastSBP, 'value')
    const sbpAlarmThreshold = getThreshold(lastSBP, tuningValue, tuningUnit) || null

    return {
      sbpAlarmThreshold,
      sbpMaxBloodUpper: MAX_BLOOD_UPPER,
      sbpMaxBloodLower: MAX_BLOOD_LOWER,
    }
  }
)

export const predictUFSelector = createSelector(
  (state) => state.patient.getIn(['record', 'risk', 'module', 'state', 'predict_uf']),
  (predict_uf) => predict_uf
)

export const isPredictableSelector = createSelector(
  lastPointSelector,
  (lastPoint) => !isValidate(false, lastPoint)
)

export const systemDisplayThreshold = createSelector(
  safeGetModuleState(moduleId),
  state => maybe(state.get('displayThreshold'))
  .orJust(null)
)

export const systemThresholdEditable = createSelector(
  safeGetModuleState(moduleId),
  state => maybe(state.get('thresholdEditable'))
  .orJust(null)
)

export const systemMaxthreshold = createSelector(
  safeGetModuleState(moduleId),
  state => maybe(state.get('max_threshold'))
  .orJust(null)
)

export const systemMinthreshold = createSelector(
  safeGetModuleState(moduleId),
  state => maybe(state.get('min_threshold'))
  .orJust(null)
)

export const systemPersonalthreshold = createSelector(
  safeGetModuleState(moduleId),
  state => maybe(state.get('personal_threshold'))
  .orJust(null)
)

export default createSelector(
  alarmSelector,
  (state) => state.routing.locationBeforeTransitions,
  categoryModuleSelector,
  libsSelector,
  selectedPointSelector,
  greenLineSelector(moduleId),
  chartRangeSelector,
  infoSelector,
  localeSelector,
  lastPointSelector,
  formDataSelector,
  simulatorSelector.reduxFormSelector,
  sbpAlarmThresholdSelector,
  predictUFSelector,
  isPredictableSelector,
  systemDisplayThreshold,
  systemThresholdEditable,
  systemMaxthreshold,
  systemMinthreshold,
  systemPersonalthreshold,
  (alarmSelectorResult, location, cm, libs, selectedPoint, greenLine, chartRange, info, l, lastPoint, initData, simulatorForm, sbpAlarmThreshold, predict_uf, isPredictable, displayThreshold, thresholdEditable, max_threshold, min_threshold, personal_threshold) => {
    const { newArrivals, ...infoProps } = info
    const makeSymbol = symbolGenerator(selectedPoint, newArrivals)
    return {
      displayAlarm: (alarmSelectorResult.alarmInfo.statusCode2Str != 'NO_DATA'),
      location,
      ...cm,
      ...libs,
      selectedPoint,
      greenLine,
      ...chartRange,
      symbols: greenLine.raw.map(makeSymbol),
      ...infoProps,
      l,
      lastPoint,
      initData,
      ...simulatorForm,
      ...sbpAlarmThreshold,
      predict_uf,
      isPredictable,
      displayThreshold,
      thresholdEditable,
      max_threshold,
      min_threshold,
      personal_threshold,
    }
  }
)
