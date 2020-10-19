import React, { Component } from 'react'
import CSSModules from 'react-css-modules'
import styles from './probability.css'
import selector from './selector'
import { connect } from 'react-redux'
import SimulatorChart from '../components/SimulatorChart'
import SbpBoard from './components/SbpBoard'
import moment from 'moment'
import { selectTime } from '../Range'
import { bindActionCreators } from 'redux'
import FormSBP from '../components/FormSBP'
import FormSetting, { optionValue } from './components/FormSetting'
import Simulator from '../components/Simulator'
import { simulate } from './actions'
import { conditionDiff, Legend } from './widgets'
import validate from './validator'
import { parseFormFields } from '../components/FormSBP/selector'
import FilterBar from 'containers/Risk/components/FilterBar'

@connect(
  selector,
  dispatch => ({
    actions: bindActionCreators({ selectTime, simulate }, dispatch),
  })
)
@CSSModules(styles)
export default class Probability extends Component {
  submitCallback = () => {
    const {
      greenLine,
      selectedTime,
      lastPoint: { time, ...lastPointValues },
      actions: { simulate },
      formValues,
    } = this.props

    if (greenLine.raw.length < 1) {
      return
    }

    const settingValues = formValues.FormSetting
    const { time: _, ...formSBPValues } = formValues.FormSBP
    const parsed = parseFormFields(formSBPValues)
    const data = {
      diff: parseInt((selectedTime - greenLine.raw[0].time) / 60000 ),
      date: moment().format('YYYY-MM-DD'),
      ...conditionDiff(settingValues.condition.value, settingValues.sbpValue, lastPointValues.sbp),
      ...lastPointValues,
      ...parsed,
      deltadia_temp_value: parsed.dia_temp_value - lastPointValues.dia_temp_value,
    }
    simulate(selectedTime, data)
  }

  render() {
    const {
      l,
      startTime,
      endTime,
      greenLine,
      symbols,
      simulateTime,
      selectedTime,
      titlePrefix,
      titleSuffix,
      condition,
      predictions,
      simulations,
      lastPoint,
      initData,
      selectedPoint,
      disableSimulator,
      sbpMaxBloodUpper,
      sbpMaxBloodLower,
      sbpAlarmThreshold,
      predict_uf,
      isPredictable,
      // 5 props below are for FilterBar
      cId,
      mId,
      categories,
      modules,
      location: { pathname, query },
    } = this.props
    const { actions: { selectTime } } = this.props
    const initEnable = Object.keys(lastPoint).length > 1
    const isSimulatorDisabled = (lastPoint.time > selectedTime) || disableSimulator
    return (
      <section styleName="container">
        <section styleName="column-left">
          <section styleName="filter-and-legend">
            <FilterBar
              pathname={pathname}
              query={query}
              cId={cId}
              mId={mId}
              categories={categories}
              modules={modules}
              l={l}/>
            <Legend l={l} />
          </section>
          <section styleName="chart-container">
            <SimulatorChart
              l={l}
              startTime={startTime}
              endTime={endTime}
              greenLine={greenLine}
              symbols={symbols.map(s => ({ ...s, customClassName: s.isNewArrival ? styles['new-arrival-pt'] : '' }))}
              clickTimeCallback={selectTime}
              selectedTime={selectedTime}
              sbpMaxBloodUpper={sbpMaxBloodUpper}
              sbpMaxBloodLower={sbpMaxBloodLower}
              sbpAlarmThreshold={sbpAlarmThreshold} />
          </section>
          <SbpBoard
            titlePrefix={titlePrefix}
            titleSuffix={titleSuffix}
            condition={condition}
            selectedTime={simulateTime}
            predictions={predictions}
            simulations={simulations} />
        </section>
        <section styleName="column-right">
          <Simulator
            validate={validate}
            initEnable={initEnable}
            initData={initData}
            isPredictable={isPredictable}
            simulatorDisabled={isSimulatorDisabled}
            styleName="simulator"
            submitCallback={this.submitCallback}
            l={l}>
            <div styleName="time">
              <span>{l('Time')}：{selectedTime ? moment(selectedTime).format('HH:mm:ss') : '─:─:─'}</span>
              <span>{l('Estimate Total UF')}：{predict_uf != null ? predict_uf : '─'}&nbsp;kg</span>
            </div>
            <span styleName="predict_uf_comment">{l('Remark')}：{l('Treat Period is using 4 hours for caculating')}</span>
            <div styleName="tag">
              <span>{l('Settings')}</span>
            </div>
            <FormSetting
              l={l}
              formName="Simulator"
              lastPoint={lastPoint} />
            <div styleName="tag">
              <span>{l('Value')}</span>
            </div>
            <FormSBP
              l={l}
              formName="Simulator"
              lastPoint={lastPoint}
              selectedPoint={selectedPoint} />
          </Simulator>
        </section>
      </section>
    )
  }
}
