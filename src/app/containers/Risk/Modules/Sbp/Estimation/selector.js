import { createSelector } from 'reselect'
import { localeSelector } from 'reducers/locale-reducer'
import { fromJS } from 'immutable'
import { safeGetModuleState } from 'containers/Risk/selector'
import { moduleId } from './reducer'
import {
  greenLineSelector,
  lastPointSelector as rangeLastPointSelector,
  selectedPointSelector,
  symbolGenerator,
  sbpAlarmThresholdSelector,
  predictUFSelector,
  isPredictableSelector,
} from '../Range/selector'
import { chartRangeSelector } from 'containers/Record/selector'
import simulatorSelector from '../components/Simulator/selector'
import { maybe } from 'maybes'
import { categoryModuleSelector, libsSelector } from 'containers/Risk/selector'

const sbpStateSelector = safeGetModuleState(moduleId)

const infoSelector = createSelector(
  sbpStateSelector,
  localeSelector,
  (state) => state.patient.getIn(['record', 'detail', 'result', 'r_id']),
  (sbpState, l, recordId) => maybe(sbpState)
    .map(state => ({
      selectedTime: state.get('selectedTime'),
      simulateTime: state.get('simulateTime'),
      newArrivals: state.get('newArrivals'),
      recordId,
    }))
    .orJust({
      selectedTime: null,
      simulateTime: null,
      newArrivals: null,
      recordId,
    })
)

export const predictionsSelector = (tag) => createSelector( // tag == predictions or simulations
  state => maybe(sbpStateSelector(state)).map(s => s.get(tag)).orJust(null),
  (predictions) => {
    const values = maybe(predictions)
      .filter(predictions => !!predictions)
      .map(predictions => predictions.toJS())

    const ub_ub = values
      .map(values => values.filter((value, idx) => idx != 0))
      .map(predictions => predictions.map(p => ({ x: p.time, y: p.Upper_bound })))
      .orJust([])
    const lb_lb = values
      .map(values => values.filter((value, idx) => idx != 0))
      .map(predictions => predictions.map(p => ({ x: p.time, y: p.Lower_bound })))
      .orJust([])
    const ub = values
      .map(values => values.filter((value, idx) => idx != 0))
      .map(predictions => predictions.map(p => ({ x: p.time, y: p.Predict })))
      .orJust([])

    return {
      ub_ub,
      lb_lb,
      ub,
    }
  }
)

export const lastPointSelector = createSelector(
  (state) => state.patient.getIn(['record', 'detail', 'result', 'dialysis_year']),
  rangeLastPointSelector,
  (dialysis_year, rangeLastPoint) => ({ dialysis_year, ...rangeLastPoint })
)

export const formDataSelector = createSelector(
  lastPointSelector,
  (lastPoint) => ({
    FormSBP: { ...lastPoint },
  })
)

export default createSelector(
  (state) => state.routing.locationBeforeTransitions,
  categoryModuleSelector,
  libsSelector,
  localeSelector,
  infoSelector,
  selectedPointSelector,
  greenLineSelector(moduleId),
  predictionsSelector('predictions'),
  predictionsSelector('simulations'),
  chartRangeSelector,
  lastPointSelector,
  formDataSelector,
  simulatorSelector.reduxFormSelector,
  sbpAlarmThresholdSelector,
  predictUFSelector,
  isPredictableSelector,
  (location, cm, libs, l, { newArrivals, ...infoProps }, selectedPoint, greenLine, predictions, simulations, chartRange, lastPoint, initData, simulatorForm, sbpAlarmThreshold, predict_uf, isPredictable) => {
    const makeSymbol = symbolGenerator(selectedPoint, newArrivals)
    return {
      location,
      ...cm,
      ...libs,
      ...chartRange,
      ...infoProps,
      lastPoint,
      greenLine,
      predictions,
      simulations,
      selectedPoint,
      symbols: greenLine.raw.map(makeSymbol),
      l,
      initData,
      ...simulatorForm,
      ...sbpAlarmThreshold,
      predict_uf,
      isPredictable,
    }
  }
)
