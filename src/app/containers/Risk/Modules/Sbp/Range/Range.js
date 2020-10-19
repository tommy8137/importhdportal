import React, { Component, PropTypes } from 'react'
import CSSModules from 'react-css-modules'
import styles from './range.css'
import SimulatorChart from '../components/SimulatorChart'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import selector from './selector'
import FormSBP from '../components/FormSBP'
import { parseFormFields } from '../components/FormSBP/selector'
import { selectTime, simulate, updatePersonaThreshold, getSystemThreshold } from './actions'
import moment from 'moment'
import Simulator from '../components/Simulator'
import { Legend } from './widgets'
import validate from './validator'
import FilterBar from 'containers/Risk/components/FilterBar'
import AlarmHandler from './components/AlarmHandler'
import button_submit from '../images/button_submit.png'

@connect(
  selector,
  (dispatch) => ({ actions: bindActionCreators({ selectTime, simulate, updatePersonaThreshold, getSystemThreshold }, dispatch) })
)
@CSSModules(styles)
export default class Range extends Component {
  // static preloader = getSystemThreshold;

  static propTypes = {
    l: PropTypes.func,
    startTime: PropTypes.number,
    actions: PropTypes.object,
    endTime: PropTypes.number,
    selectedTime: PropTypes.number,
  }

  state = {
    settingValueIsTouched: { personal_threshold: false },
    isAnyError: null,
    personal_threshold_value: null,
  }

  printErrorMsg = (l, errorMsg) => {
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

  handleInputFocus = (e) => {
    this.setState({ settingValueIsTouched: { ...this.state.settingValueIsTouched, ['personal_threshold']: true } } )
  }

  handleInputBlur = (e) => {
    if (!this.state.personal_threshold_value){
      this.setState({ isAnyError: false })
    } else {
      this.setState({ settingValueIsTouched: { ...this.state.settingValueIsTouched, ['personal_threshold']: false } } )
    }
  }

  handleInputChange = (value) => {
    const { max_threshold, min_threshold } = this.props
    let this_value = parseFloat(value.target.value)
    let maxValue = parseFloat(max_threshold)
    let minValue = parseFloat(min_threshold)
    if ( maxValue >= this_value && minValue <= this_value){
      this.setState({ personal_threshold_value: this_value, isAnyError: false })
    } else {
      this.setState({ personal_threshold_value: this_value, isAnyError: true })
    }
  }

  handleSubmit = () => {
    const { max_threshold, min_threshold, displayThreshold, thresholdEditable, actions: { updatePersonaThreshold } } = this.props
    const { personal_threshold_value } = this.state
    if ( displayThreshold === '1' && thresholdEditable === '1'){
      let this_value = parseFloat(personal_threshold_value)
      let maxValue = parseFloat(max_threshold)
      let minValue = parseFloat(min_threshold)
      if ( maxValue >= this_value && minValue <= this_value){
        updatePersonaThreshold(personal_threshold_value)
        this.setState({  isAnyError: false })
      } else {
        this.setState({ isAnyError: true })
      }
    }
  }

  submitCallback = () => {
    const {
      selectedTime,
      endTime,
      actions: { simulate },
      formValues,
      lastPoint: { time, ...lastPointValues },
    } = this.props

    const { time: _, ...formSBPValues } = formValues.FormSBP
    const parsed = parseFormFields(formSBPValues)
    simulate(
      {
        ...lastPointValues,
        ...parsed,
        deltadia_temp_value: parsed.dia_temp_value - lastPointValues.dia_temp_value,
      },
      selectedTime,
      endTime
    )
  }

  render() {
    const {
      displayAlarm,
      l,
      greenLine,
      symbols,
      startTime,
      endTime,
      selectedTime,
      // remindings,
      predictions,
      simulation,
      initData,
      lastPoint,
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

      displayThreshold,
      thresholdEditable,
      max_threshold,
      min_threshold,
      personal_threshold,
    } = this.props
    const { actions: { selectTime } } = this.props
    const { settingValueIsTouched, isAnyError } = this.state
    // move the below into selector
    // const initData = { FormSBP: lastPoint }
    const initEnable = Object.keys(lastPoint).length > 1
    const isSimulatorDisabled = (lastPoint.time > selectedTime) || disableSimulator
    let System_Threshold = l('System Threshold')
    return (
      <section styleName="container">
        <section styleName="column-left">

            <section styleName="alarm-handle-section">
               <AlarmHandler selectedTime={selectedTime} />
               {
                (displayThreshold === '1') && (
                  <div styleName="row">
                      <div styleName="label-threshold-title">{l('Alarm Threshold')}:&nbsp;</div>
                      <div>
                        <input style={{ whiteSpace: 'pre', width: 107, cursor: thresholdEditable === '0' ? 'not-allowed' : 'text' }}
                              styleName={ isAnyError ? 'shadow-input-error' : 'shadow-input'}
                              type={'text'}
                              min={1} max={900}
                              id="personal_threshold"
                              onFocus={this.handleInputFocus}
                              onBlur={this.handleInputBlur}
                              onChange={this.handleInputChange}
                              disabled={thresholdEditable === '0'}
                              placeholder={personal_threshold === 999 ? System_Threshold : personal_threshold}>
                              {/* defaultValue={personal_threshold === 999 ? System_Threshold : personal_threshold}> */}
                        </input>
                      </div>
                      {(thresholdEditable === '1') && (
                      <div style={{ marginLeft: 6, marginTop: 6 }}>
                        <img
                          alt={'button_submit'}
                          src={button_submit}
                          style={{
                            cursor: 'pointer',
                          }}
                          onClick={this.handleSubmit} />
                      </div>
                      )}
                       <div styleName="error-container">
                          {
                            <div styleName={ (settingValueIsTouched['personal_threshold']) && (isAnyError) ? 'hint-box' : 'hint-box-hidden' }>
                              {this.printErrorMsg(l, `${min_threshold},${max_threshold}`)}
                            </div>
                          }
                       </div>
                  </div>
                )}
            </section>

          <section styleName="filter-and-legend">
            <FilterBar
              pathname={pathname}
              query={query}
              cId={cId}
              mId={mId}
              categories={categories}
              modules={modules}
              l={l} />
            <Legend l={l} />
          </section>
          <section styleName="chart-container">
            <SimulatorChart
              l={l}
              startTime={startTime}
              endTime={endTime}
              greenLine={greenLine}
              symbols={symbols.map(s => ({
                ...s,
                customClassName: s.isNewArrival ? styles['new-arrival-pt'] : '',
              }))}
              clickTimeCallback={selectTime}
              predictions={predictions}
              simulation={simulation}
              selectedTime={selectedTime}
              sbpMaxBloodUpper={sbpMaxBloodUpper}
              sbpMaxBloodLower={sbpMaxBloodLower}
              sbpAlarmThreshold={sbpAlarmThreshold} />
          </section>
          {/* 20170412 temporarily marked<div styleName="comment-label">{l('Reminding')}</div>
           <pre styleName="comment">
            {remindings}
          </pre>*/}
        </section>
        <section styleName="column-right">
          <Simulator
            validate={validate}
            initEnable={initEnable}
            initData={initData}
            isPredictable={isPredictable}
            simulatorDisabled={isSimulatorDisabled}
            submitCallback={this.submitCallback}
            styleName="simulator"
            l={l}>
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
