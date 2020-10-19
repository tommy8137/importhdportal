import React, { Component, PropTypes } from 'react'
import CSSModules from 'react-css-modules'
import styles from './overview.css'
import MotionProgressBar from './components/ProgressBar'
import MotionPieChart from './components/PieChart'
import AbnormalListTable from './components/AbnormalListTable'
import Select from 'react-select'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import moment from 'moment'
import { selectPatient } from 'actions/patient-action'
import { actionCreators, preload } from './actions'
import { selector } from './selector.js'

const GREEN = '#5aa5ab'
const GREY = '#AAA'

//-----------------------------------------------------------------------------
// connect function
//-----------------------------------------------------------------------------
const mapDispatchToProps = (dispatch) => (
  { actions: bindActionCreators({ ...actionCreators, selectPatient }, dispatch) }
)

@connect(selector, mapDispatchToProps)
@CSSModules(styles)
export default class OverviewChart extends Component {
  //-----------------------------------------------------------------------------
  // fetch before render
  //-----------------------------------------------------------------------------
  static preloader = preload

  //-----------------------------------------------------------------------------
  // constant
  //-----------------------------------------------------------------------------
  static statics = {
    ATTENDED_COLOR: GREEN,
    NORMAL_COLOR: GREEN,
    ABNORMAL_COLOR: 'red',
    ABSENT_COLOR: GREY,
    PROGRESS_BAR_WIDTH: 570,
  }

  static propTypes = {
    // redux action
    actions: PropTypes.object,
    // from overview api
    statistics: PropTypes.object,
    // from abnormallist api
    abnormalList: PropTypes.array,
    // calculate in reselector
    attendenceRate: PropTypes.number,
    absentRate: PropTypes.number,
    normalRate: PropTypes.number,
    abnormalRate: PropTypes.number,
    // locale
    l: PropTypes.func,
  }

  //-----------------------------------------------------------------------------
  // dynamic 2nd bar width
  //-----------------------------------------------------------------------------
  getAttendenceRatePosition = (attended, total, PROGRESS_BAR_WIDTH) => (
    attended / total * PROGRESS_BAR_WIDTH || 0
  )

  //-----------------------------------------------------------------------------
  // event handler
  //-----------------------------------------------------------------------------
  shiftChange = (option) => {
    const { changeShift } = this.props.actions
    changeShift(option.value)
  }

  areaChange = (option) => {
    const { changeArea } = this.props.actions
    changeArea(option.value)
  }

  pieClick = (category) => {
    const { changeCategory } = this.props.actions
    changeCategory(this.props.shift, category, this.props.areaSelected)
  }

  pieBPClick = (type) => {
    const { changeBPType } = this.props.actions
    changeBPType(this.props.shift, type)
  }

  abnormalListClick = (user) => {
    this.props.actions.selectPatient(user)
  }

  //-----------------------------------------------------------------------------
  render() {
    const {
      PROGRESS_BAR_WIDTH,
      ATTENDED_COLOR,
      NORMAL_COLOR,
      ABSENT_COLOR,
      ABNORMAL_COLOR,
    } = OverviewChart.statics

    const {
      statistics: {
        total,
        attended,
        notAttend,
        abnormal,
        normal,
        pieChart,
        attendenceRate,
        absentRate,
        normalRate,
        abnormalRate,
        categories,
      },
      l,
      category,
      shift,
      shifts,
      bpClass,
      subPieChart,
      area,
      areaSelected,
    } = this.props

    const attendenceRatePosition = this.getAttendenceRatePosition(attended, total, PROGRESS_BAR_WIDTH)
    const normalRateBarWidth
      = attendenceRatePosition || PROGRESS_BAR_WIDTH // if 1st bar completed rate 0%, force expand 2nd bar
    let ShowRiskCategoryPie = false

    return (
      <div styleName="overview-chart">
        <div styleName="overview-left-block">
          <div styleName="overview-left-top-block">
            <div styleName="category-selector">
              <Select
                clearable={false}
                searchable={false}
                styleName="dropdown"
                placeholder="--"
                options={shifts}
                value={shift}
                onChange={this.shiftChange} />
              <div styleName="duration-symbol"></div>
              <Select
                clearable={false}
                searchable={false}
                styleName="dropdown"
                placeholder="--"
                options={area}
                value={areaSelected}
                onChange={this.areaChange} />
            </div>
            <div styleName="date-label">
              {moment().format('YYYY-MM-DD')}
            </div>
          </div>
          <div styleName="overview-left-left-block">
            <div styleName="total-nums-label">
              {l('Total')}: <span styleName="green-text">{total}</span>
            </div>
            <div styleName="actual-nums-label">
              {l('Attended')}: <span styleName="green-text">{attended}</span>
            </div>
            <div styleName="abnormal-nums-label">
              {l('Abnormal')}: <span styleName="red-big-text">{abnormal}</span>
            </div>
          </div>
          <div styleName="overview-left-right-block">
            <div styleName="upperbar-description">
              <div>{l('Attended %s  ').replace('%s', attended)}({attendenceRate}%)</div>
              <div>{l('Not Attend %s').replace('%s', notAttend)}({absentRate}%)</div>
            </div>
            <MotionProgressBar
              key={`attendenceBar-${shift}`}
              name="attendenceBar"
              totalLength={PROGRESS_BAR_WIDTH}
              finishPercent={attendenceRate}
              finishColor={ATTENDED_COLOR}
              unFinishColor={ABSENT_COLOR} />
            <div styleName="lower-description" style={{ width: normalRateBarWidth + 2 }}>
              <div>{l('Normal %s').replace('%s', normal)}({normalRate}%)</div>
              <div styleName="red-text">
                {l('Abnormal %s').replace('%s', abnormal)}({abnormalRate}%)
              </div>
            </div>
            <MotionProgressBar
              key={`normalRateBar-${shift}`}
              name="normalRateBar"
              totalLength={normalRateBarWidth}
              finishPercent={normalRate}
              finishColor={NORMAL_COLOR}
              unFinishColor={(attendenceRatePosition === 0) ? ABSENT_COLOR : ABNORMAL_COLOR} />
            {ShowRiskCategoryPie == true &&
              <div styleName="pie-group">
                 <MotionPieChart
                  shift={shift}
                  data={pieChart}
                  selectedClass={category}
                  clickCallback={this.pieClick}
                  abnormalTypeAndColors={categories}
                  BPTypeAndColors={bpClass.BPcolors}
                  width={600}
                  height={250}
                  borderWidth={2}
                  outerRadius={100}
                  ringWidth={45}
                  middleCircleText={l('All')}
                  middleCirclePadding={3}
                  pieChartText='c_name' />
              <div styleName="pie-description">{l('Risk Category (Cases)')}</div>
              </div>
            }
            <div>
              <MotionPieChart
                shift={shift}
                data={subPieChart}
                selectedClass={bpClass.bp_class}
                clickCallback={this.pieBPClick}
                abnormalTypeAndColors={categories}
                BPTypeAndColors={bpClass.BPcolors}
                width={600}
                height={250}
                borderWidth={2}
                outerRadius={100}
                ringWidth={45}
                middleCircleText={l('All')}
                middleCirclePadding={3}
                pieChartText='type' />
            </div>
          </div>
        </div>
        <div styleName="overview-right-block">
          <AbnormalListTable abnormalListClick={this.abnormalListClick} l={l} selectedBPClass={bpClass.bp_class}/>
        </div>
      </div>
    )
  }
}
