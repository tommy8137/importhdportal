import { createSelector } from 'reselect'
import { leftFields } from '../../schemas/record-schema'
import Immutable, { fromJS } from 'immutable'
import { localeSelector } from 'reducers/locale-reducer'
import moment from 'moment'
import { NULL_VALUE } from 'common/constant'

const DIALYSIS_PRE = 0 // 已報到
const DIALYSIS_INTRA = 1 // 透析中
const DIALYSIS_POST = 2 // 透析結束

export const chartRangeSelector = createSelector(
  (state) => state.patient.getIn(['record', 'detail', 'result']),
  (result) => {
    if (!result) {
      return {
        startTime: null,
        endTime: null,
        disableSimulator: true,
        isRecordFinished: true,
      }
    }

    const dialysisStatus = result.get('status')
    const isRecordFinished = dialysisStatus ? (dialysisStatus ==  DIALYSIS_POST) : false
    const disableSimulator = !!dialysisStatus && (dialysisStatus ==  DIALYSIS_POST || dialysisStatus == DIALYSIS_PRE)
    const startTime = roundStartTime(parseInt(result.get('start_time')))
    const endTime = disableSimulator
      ? ceilEndTime(parseInt(result.get('end_time')))
      : moment(startTime).add(5, 'h').valueOf()
    return {
      startTime,
      endTime,
      disableSimulator,
      isRecordFinished,
    }
  }
)

const dataSelector = createSelector(
  (state) => state.patient.getIn(['record', 'detail', 'result', 'r_id']),
  (state) => state.patient.getIn(['record', 'detail', 'entities']),
  (state) => state.patient.getIn(['record', 'detail', 'result', 'items']),
  (recordId, entities, resultItems) => {
    const items = entities.get('items')
    if (!recordId || !items) {
      return {}
    }
    let index = -1
    const filtered = items
      .filter(item => item.get('type') == 'chart')
      .sort((a, b) => resultItems.indexOf(a.get('ri_id')) > resultItems.indexOf(b.get('ri_id')))
    const datas = filtered.map((item) => {
      const data = item.get('data').toJS()
      const highlights = []
      data.forEach((d, i) => {
        if (d.status == 1) {
          highlights.push(i)
        }
      })
      index = index + 1
      return {
        recordId,
        id: item.get('ri_id'),
        index,
        totalSize: filtered.size,
        points: data.map(d => ({ time: parseInt(d.time), value: d.value, status: d.status })),
        times: data.map(d => parseInt(d.time)),
        values: data.map(d => d.value),
        highlights,
      }
    }).toJS()
    return datas
  }
)

const distinctTimesSelector = createSelector(
  dataSelector,
  (datas) => {
    const distinctTimes = Object.keys(datas).reduce((times, key) => {
      datas[key].times.forEach(t => {
        if (!times.includes(t)) {
          times.push(t)
        }
      })
      return times
    }, []).sort()
    return distinctTimes
  }
)

const panelsSelector = createSelector(
  (state) => state.patient.getIn(['record', 'detail', 'entities']),
  (entities) => {
    const selectPanel = (panelName, ...others) => {
      if (!entities.get(panelName)) {
        return fromJS([])
      }
      const totalsBefore = others.reduce((total, curr) => { // total number of panel items before this panel
        total = entities.get(curr)
          ? total + entities.get(curr).size
          : total
        return total
      }, 0)
      const panel = entities.get(panelName)
      return panel
        .sort((pi1, pi2) => pi2.get('time') - pi1.get('time'))
        .map(pi => pi.merge({
          time: parseInt(pi.get('time')),
        }))
        .valueSeq()
        .map((pi, idx) => pi.set('number', totalsBefore + panel.size - idx))
    }

    const pre = selectPanel('pre')
    const intra = selectPanel('intra', 'pre')
    const post = selectPanel('post', 'intra', 'pre')
    return {
      pre,
      post,
      intra,
    }
  }
)

const entitiesSelector = createSelector(
  (state) => state.patient.getIn(['record', 'detail', 'entities']),
  (state) => state.patient.getIn(['record', 'detail', 'result']),
  panelsSelector,
  chartRangeSelector,
  (entities, result, panels, { startTime, endTime }) => {
    if (!entities.get('items')) {
      return {
        recordId: null,
        startTime,
        endTime,
        timesOfDialyze: '--',
        text: [],
        panels,
      }
    }

    const textNotToDisplay = ['deltadia_temp_value', 'pre_dia_temp_value', 'target_uf', 'delta_bloodflow', 'delta_uf']
    const text = entities.get('items').filter(
      (item, idx) => {
        return (item.get('type') == 'text') && !textNotToDisplay.includes(item.get('ri_id'))
      }).valueSeq()
    const resultPanels = result.get('panels')

    return {
      recordId: result.get('r_id'),
      text,
      startTime,
      endTime,
      timesOfDialyze: result.get('times_of_dialyze') && result.get('times_of_dialyze') != NULL_VALUE ? result.get('times_of_dialyze'): '--',
      panels,
    }
  }
)

const detailSelector = createSelector(
  (state) => state.patient.getIn(['record', 'detail']),
  entitiesSelector,
  dataSelector,
  (detail, entities, datas) => {
    const items = detail.getIn(['entities', 'items'])
      ? detail.getIn(['entities', 'items'])
      : fromJS([])
    const resultItems = detail.getIn(['result', 'items'])
      ? detail.getIn(['result', 'items'])
      : fromJS([])

    const toggled = detail.get('toggled')
    const params = items
      .filter((item, idx) => item.get('type') == 'chart')
      .map(item => {
        const id = item.get('ri_id')
        return item.set('toggled', toggled.get(id, false))
      })
      .valueSeq()
      .sort((a, b) => resultItems.indexOf(a.get('ri_id')) > resultItems.indexOf(b.get('ri_id')) )

    const selectedTime = detail.get('selectedTime')
    const { text, startTime, endTime, timesOfDialyze, panels, recordId } = entities
    return {
      recordId,
      selectedTime,
      params,
      text,
      datas,
      toggled,
      panels,
      startTime,
      endTime,
      timesOfDialyze,
    }
  }
)

export default createSelector(
  (state) => state.globalConfigs.get('notesformat'),
  localeSelector,
  detailSelector,
  distinctTimesSelector,
  (notesformat, l, detail, distinctTimes) => {
    return {
      notesformat,
      l,
      distinctTimes,
      ...detail,
    }
  }
)

function roundStartTime(time) {
  if (!time) {
    return null
  }
  return Math.floor(time / (1000 * 60 * 30) ) * (1000 * 60 * 30)
}

function ceilEndTime(time) {
  if (!time) {
    return null
  }
  return Math.ceil(time / (1000 * 60 * 30) ) * (1000 * 60 * 30)
}
