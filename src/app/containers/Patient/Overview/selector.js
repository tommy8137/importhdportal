import { createSelector } from 'reselect'
import { localeSelector } from 'reducers/locale-reducer'

const colors = ['#84cbc8', '#5eccc2', '#53b3aa', '#47998e', '#3d827c',
               '#2ec1ba', '#2aaaa0', '#1ea093', '#268478', '#11635c']

//-----------------------------------------------------------------------------
// reselectors
//-----------------------------------------------------------------------------
const calculateRates = (attended, notAttend, total, normal, abnormal) => {
  // prevent divid zero
  const attendenceRate = total ? (parseFloat((attended / total * 100).toFixed(2)) || 0) : 0
  const absentRate = total ? (parseFloat((notAttend / total * 100).toFixed(2)) || 0) : 0
  const normalRate = attended ? (parseFloat((normal / attended * 100).toFixed(2)) || 0) : 0
  const abnormalRate = attended ? (parseFloat((abnormal / attended * 100).toFixed(2)) || 0) : 0
  return { attendenceRate, absentRate, normalRate, abnormalRate }
}

const statisticsSelector = createSelector(
  (state) => (state.overview.overview.get('statistics')),
  (statistics) => {
    const rates = calculateRates(
      statistics.get('attended'),
      statistics.get('notAttend'),
      statistics.get('total'),
      statistics.get('normal'),
      statistics.get('abnormal')
    )

    const types = []
    statistics.get('pieChart').forEach((category) => {
      types.push(category.get('c_name'))
    })

    let pieChart = statistics.get('pieChart').toJS().map((category) => {
      category['c_text'] = category.c_name
      return category
    })

    const categories = {
      types,
      colors,
    }

    return {
      total: statistics.get('total'),
      attended: statistics.get('attended'),
      notAttend: statistics.get('notAttend'),
      normal: statistics.get('normal'),
      abnormal: statistics.get('abnormal'),
      pieChart: pieChart, // this is for d3.js use, so must in plain array form
      ...rates,
      categories,
    }
  }
)

const abnormalListSelector = createSelector(
  (state) => (state.overview.overview.get('abnormalList')),
  (abnormalList) => {
    const abnormalArray = []
    abnormalList.forEach((abMap) => {
      abnormalArray.push(abMap)
    })
    return abnormalArray
  }
)

const shiftsSelector = createSelector(
  (state) => (state.overview.overview.get('shifts')),
  localeSelector,
  (shifts, l) => {
    const newShifts = []
    if (shifts) {
      shifts.forEach(
        (shift) => {
          newShifts.push({ value: shift.get('s_id'), label: shift.get('s_name') })
        }
      )
      newShifts.push({ value: 'all', label: l('All') })
    }
    return newShifts
  }
)

const bpClassSelector = createSelector(
  (state) => state.overview.overview.get('bp_class'),
  (data) => {
    const BPcolors = {
      types: ['normal', 'selected'],
      colors: ['#59988f', '#f08d51'],
    }
    return {
      bp_class: data,
      BPcolors,
    }
  }
)

const subPieChartSelector = createSelector(
  (state) => state.overview.overview.get('statistics'),
  (state) => state.overview.overview.get('category'),
  (state) => state.globalConfigs.get('maxblood_lower'),
  (state) => state.globalConfigs.get('maxblood_upper'),
  (statistics, result, maxblood_lower, maxblood_upper) => {
    let PieChart = statistics.get('pieChart').toJS().filter((data) => data.c_name == result)
    let subPieChart
    if (PieChart.length > 0 ){
      subPieChart = PieChart[0].chart_detail.map(
        (data) => {
           //SBP from config setting
          if (data.type == 'lower') {
            data['c_text'] = maxblood_lower.toString() + '>SBP'
          } else if (data.type == 'upper') {
            data['c_text'] = 'SBP>' + maxblood_upper.toString()
          } else if (data.type == 'middle') {
            data['c_text'] = maxblood_lower.toString() + '≦SBP≦' + maxblood_upper.toString()
          }
          return data
        }
      )
    }
    return subPieChart
  }
)

const areaSelector = createSelector(
  (state) => (state.overview.overview.get('area')),
  localeSelector,
  (area, l) => {
    const newArea = []
    if (area && area.lenght != 0) {
      area.forEach(
        (data) => {
          newArea.push({ value: data, label: data })
        }
      )
    }
    newArea.push({ value: 'all', label: l('All') })
    return newArea
  }
)

export const selector = createSelector(
  shiftsSelector,
  areaSelector,
  abnormalListSelector,
  statisticsSelector,
  (state) => (state.overview.overview.get('category')),
  (state) => (state.overview.overview.get('shift')),
  (state) => (state.overview.overview.get('areaSelected')),
  localeSelector,
  bpClassSelector,
  subPieChartSelector,
  (shifts, area, abnormalList, statistics, category, shift, areaSelected, l, bpClass, subPieChart) => ({
    abnormalList,
    statistics,
    category,
    shift,
    shifts,
    area,
    areaSelected,
    l,
    bpClass,
    subPieChart,
  })
)
