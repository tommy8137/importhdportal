import React, { Component } from 'react'
import CSSModules from 'react-css-modules'
import styles from './estimation.css'
import SimulatorChart from '../components/SimulatorChart'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import selector from './selector'
import { selectTime } from '../Range'
import validate from '../Range/validator'
import Simulator from '../components/Simulator'
import FormSBP from '../components/FormSBP'
import moment from 'moment'
import { simulate } from './actions'
import { Legend } from './widgets'
import { parseFormFields } from '../components/FormSBP/selector'
import FilterBar from 'containers/Risk/components/FilterBar'

@connect(
  selector,
  dispatch => ({ actions: bindActionCreators({ selectTime, simulate }, dispatch) })
)
@CSSModules(styles)
export default class extends Component {
  submitCallback = () => {
    const {
      formValues: {
        FormSBP: {
          time,
          ...fields,
        },
      },
      endTime,
      selectedPoint,
      lastPoint,
    } = this.props
    const { actions: { simulate } } = this.props
    const data = parseFormFields(fields)
    data.deltadia_temp_value = data.dia_temp_value - lastPoint.dia_temp_value,
    simulate(data, selectedPoint.time, endTime)
  }

  render() {
    const { l, greenLine, startTime, endTime, symbols, actions: { selectTime } } = this.props
    const {
      selectedTime,
      lastPoint,
      disableSimulator,
      initData,
      selectedPoint,
      predictions,
      simulations,
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
              selectedTime={selectedTime}
              clickTimeCallback={selectTime}
              greenLine={greenLine}
              predictions={predictions}
              simulation={simulations}
              symbols={symbols}
              sbpMaxBloodUpper={sbpMaxBloodUpper}
              sbpMaxBloodLower={sbpMaxBloodLower}
              sbpAlarmThreshold={sbpAlarmThreshold} />
          </section>
        </section>
        <section styleName="column-right">
          <Simulator
            styleName="simulator"
            initData={initData}
            isPredictable={isPredictable}
            initEnable={Object.keys(lastPoint).length > 1}
            simulatorDisabled={lastPoint.time > selectedTime || disableSimulator}
            validate={validate}
            l={l}
            submitCallback={this.submitCallback}>
            <div styleName="time">
              <span>{l('Time')}：{selectedTime ? moment(selectedTime).format('HH:mm:ss') : '─:─:─'}</span>
              <span>{l('Estimate Total UF')}：{predict_uf != null ? predict_uf : '─'}&nbsp;kg</span>
            </div>
            <span styleName="predict_uf_comment">{l('Remark')}：{l('Treat Period is using 4 hours for caculating')}</span>
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
