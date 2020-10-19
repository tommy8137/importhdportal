import { createSelector } from 'reselect'
import { localeSelector } from 'reducers/locale-reducer'
import { fromJS } from 'immutable'
import { safeGetModuleState } from 'containers/Risk/selector'
import { moduleId } from './reducer'
import { greenLineSelector,
         lastPointSelector,
         selectedPointSelector,
         symbolGenerator,
         sbpAlarmThresholdSelector,
         isPredictableSelector,
         predictUFSelector } from '../Range/selector'
import { chartRangeSelector } from 'containers/Record/selector'
import simulatorSelector from '../components/Simulator/selector'
import { optionValue } from './components/FormSetting'
import { categoryModuleSelector, libsSelector } from 'containers/Risk/selector'

const conditionSelector = createSelector(
  safeGetModuleState(moduleId),
  greenLineSelector(moduleId),
  localeSelector,
  (sbpState, greenLine, l) => {
    if (!sbpState || greenLine.raw.length < 1) {
      return null
    }
    if (!sbpState.get('simulateTime')) {
      return null
    }
    const BA = sbpState.get('ul') == 1? l('Above'): l('Below') // Below/Above
    const DI = sbpState.get('ul') == 1? l('Increase'): l('Decrease')  // Decrease/Increase
    const sbp = greenLine.raw[greenLine.raw.length - 1].value//lastPoint.sbp
    const percentage = Math.round(Math.abs(sbpState.get('ulnum') - sbp) / sbp * 100) || 0
    const condition = `${BA}${Math.round(sbpState.get('ulnum'))}mmHg(${DI}${percentage}%)`
    return condition
  }
)

const infoSelector = createSelector(
  safeGetModuleState(moduleId),
  conditionSelector,
  localeSelector,
  (state) => state.patient.getIn(['record', 'detail', 'result', 'r_id']),
  (sbpState, condition, l, recordId) => {
    if (!sbpState) {
      return {
        selectedTime: null,
        simulateTime: null,
        titlePrefix: null,
        titleSuffix: null,
        condition: null,
        predictions: fromJS([]),
        simulations: fromJS([]),
        newArrivals: null,
        recordId,
      }
    }
    const titles = l('Probability of SBP while %s').split('%s')
    return {
      selectedTime: sbpState.get('selectedTime'),
      simulateTime: sbpState.get('simulateTime'),
      titlePrefix: titles[0],
      titleSuffix: titles[1],
      condition,
      predictions: sbpState.get('predictions'),
      simulations: sbpState.get('simulations'),
      newArrivals: sbpState.get('newArrivals'),
      recordId,
    }
  }
)

const formDataSelector = createSelector(
  lastPointSelector,
  localeSelector,
  (lastPoint, l) => {
    return {
      FormSBP: lastPoint,
      FormSetting: {
        condition: { label: l(optionValue[1]), value: optionValue[1] },
        sbpValue: 100,
      },
    }
  }
)

// the logic of green line is the same
export default createSelector(
  (state) => state.routing.locationBeforeTransitions,
  categoryModuleSelector,
  libsSelector,
  selectedPointSelector,
  greenLineSelector(moduleId),
  chartRangeSelector, // startTime endTime
  infoSelector,
  localeSelector,
  lastPointSelector,
  formDataSelector,
  simulatorSelector.reduxFormSelector,
  sbpAlarmThresholdSelector,
  predictUFSelector,
  isPredictableSelector,
  (location, cm, libs, selectedPoint, greenLine, chartRange, info, l, lastPoint, initData, simulatorForm, sbpAlarmThreshold, predict_uf, isPredictable) => {
    const { newArrivals, ...infoProps } = info
    const makeSymbol = symbolGenerator(selectedPoint, newArrivals)
    return {
      location,
      ...cm,
      ...libs,
      selectedPoint,
      ...chartRange,
      ...infoProps,
      greenLine,
      symbols: greenLine.raw.map(makeSymbol),
      l,
      lastPoint,
      initData,
      ...simulatorForm,
      ...sbpAlarmThreshold,
      predict_uf,
      isPredictable,
    }
  }
)
