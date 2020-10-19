import React, { Component } from 'react'
import CSSModules from 'react-css-modules'
import styles from '../style.css'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { logs, setUserTimeout, getSetting, getThresholdSetting, setThresholdSetting } from './actions'
import { updateSystemThreshold } from '../../Risk/Modules/Sbp/Range/actions'
import Form from './Form'
import switch_setting_on from './Images/switch_setting_on.png'
import switch_setting_off from './Images/switch_setting_off.png'
import { getFormSyncErrors, formValueSelector } from 'redux-form'
import Button from 'components/Buttons/ButtonDefault'

@connect(
  (state) => ({
    titleTimeout: state.locale.get('locale').get('Timeout Setting'),
    titleSystem: state.locale.get('locale').get('System Report'),
    titleThresholdSetting: state.locale.get('locale').get('Personal Alarm Threshold'),
    upperBound: state.locale.get('locale').get('Upper Bound'),
    lowerBound: state.locale.get('locale').get('Lower Bound'),
    submit: state.locale.get('locale').get('Submit'),
    labelTimeout: state.locale.get('locale').get('Timeout'),
    labelChange: state.locale.get('locale').get('Change'),
    logExport: state.locale.get('locale').get('Log Export'),
    min: state.locale.get('locale').get('min'),
    l: (word) => state.locale.get('locale').get(word),
    valueTimeout: state.admin.setting.get('timeout_minute'),
    syncError: getFormSyncErrors('timeout-setting')(state),
    valueCurrent: formValueSelector('timeout-setting')(state, 'timeout'),
    ThresholdStatusCurrent: state.admin.setting.get('threshold_status'),
    MaxThresholdCurrent: state.admin.setting.get('max_threshold'),
    MinThresholdCurrent: state.admin.setting.get('min_threshold'),
  }),
  (dispatch) => ({
    actions: bindActionCreators({ logs, setUserTimeout, setThresholdSetting, updateSystemThreshold }, dispatch),
  })
)
@CSSModules(styles)
export default class extends Component {
  static preloader = getSetting
  static preloader = getThresholdSetting

  state = {
    MaxThresholdCurrent: null,
    MinThresholdCurrent: null,
    settingValueIsTouched: { upperBound: false, lowerBound: false },
    isAnyError: null,
  }

  componentDidMount() {
    this.componentWillReceiveProps(this.props)
  }

  componentWillReceiveProps(newProps) {
    const { MaxThresholdCurrent, MinThresholdCurrent } = newProps
    if (MaxThresholdCurrent && MinThresholdCurrent) {
      this.setState({
        MaxThresholdCurrent,
        MinThresholdCurrent,
      })
    }
  }

  handleLogExport = (e) => {
    e.preventDefault()
    const { actions: { logs } } = this.props
    logs()
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

  handleBlur = (field) => (e) => {
    this.setState({ settingValueIsTouched: { ...this.state.settingValueIsTouched, [field]: true } } )
  }

  handleMaxThresholdChange = (value) => {
    const { MinThresholdCurrent } = this.state
    let this_value = parseFloat(value.target.value)
    let minValue = parseFloat(MinThresholdCurrent)
    if ( minValue > this_value || this_value < 1 || this_value > 900 ){
      this.setState({ MaxThresholdCurrent: this_value, isAnyError: true })
    } else {
      this.setState({ MaxThresholdCurrent: this_value, isAnyError: false })
    }
  }

  handleMinThresholdChange = (value) => {
    const { MaxThresholdCurrent } = this.state
    let this_value = parseFloat(value.target.value)
    let maxValue = parseFloat(MaxThresholdCurrent)
    if ( maxValue < this_value || this_value < 1 || this_value > 900 ){
      this.setState({ MinThresholdCurrent: this_value, isAnyError: true })
    } else {
      this.setState({ MinThresholdCurrent: this_value, isAnyError: false })
    }
  }

  handleSubmitThreshold = (e) => {
    const { MaxThresholdCurrent, MinThresholdCurrent } = this.state
    const { actions: { setThresholdSetting, updateSystemThreshold } } = this.props
    if ( MaxThresholdCurrent < MinThresholdCurrent || MaxThresholdCurrent < 1 || MaxThresholdCurrent > 900 || MinThresholdCurrent < 1 || MinThresholdCurrent > 900 || MinThresholdCurrent === MaxThresholdCurrent){
      if (MaxThresholdCurrent < MinThresholdCurrent){
        this.setState({ isAnyError: true, settingValueIsTouched: { ...this.state.settingValueIsTouched, ['lowerBound']: true } })
      }
      if (MaxThresholdCurrent < 1 || MaxThresholdCurrent > 900){
        this.setState({ isAnyError: true, settingValueIsTouched: { ...this.state.settingValueIsTouched, ['upperBound']: true } })
      }
      if (MinThresholdCurrent < 1 || MinThresholdCurrent > 900){
        this.setState({ isAnyError: true, settingValueIsTouched: { ...this.state.settingValueIsTouched, ['lowerBound']: true } })
      }
      if (MinThresholdCurrent === MaxThresholdCurrent){
        this.setState({ isAnyError: true, settingValueIsTouched: { ...this.state.settingValueIsTouched, ['lowerBound']: true, ['upperBound']: true } })
      }
    } else {
      let thresholdSetting = {
        status: '1',
        max_threshold: MaxThresholdCurrent,
        min_threshold: MinThresholdCurrent,
      }
      setThresholdSetting(thresholdSetting)
      this.setState({ ThresholdStatusCurrent: '1', MaxThresholdCurrent, MinThresholdCurrent })
      updateSystemThreshold(thresholdSetting)
    }
  }

  handleThresholdSwitch = (ThresholdStatusCurrent, MaxThresholdCurrent, MinThresholdCurrent) => (e) => {
    const { actions: { setThresholdSetting, updateSystemThreshold } } = this.props
    let thresholdSetting = {
      status: ThresholdStatusCurrent,
      max_threshold: MaxThresholdCurrent,
      min_threshold: MinThresholdCurrent,
    }
    setThresholdSetting(thresholdSetting)
    this.setState({ ThresholdStatusCurrent, MaxThresholdCurrent, MinThresholdCurrent })
    updateSystemThreshold(thresholdSetting)
  }

  render() {
    const { l, children, valueTimeout, titleSystem, logExport, titleTimeout, titleThresholdSetting, ThresholdStatusCurrent, upperBound, lowerBound, submit, ...rest } = this.props
    const { MaxThresholdCurrent, MinThresholdCurrent, settingValueIsTouched, isAnyError } = this.state
    return (
      <div styleName="container">
        <div styleName="block">
          <div styleName="header">{titleThresholdSetting}</div>
          <div styleName="threshold-body">
          <div styleName="row">
              <label styleName="label-threshold-title">{titleThresholdSetting}:&nbsp;</label>
              <div>
              <img
                alt={ThresholdStatusCurrent === '1' ? 'switch_setting_on' : 'switch_setting_off'}
                src={ThresholdStatusCurrent === '1' ? switch_setting_on : switch_setting_off}
                style={{
                  cursor: 'pointer',
                }}
                onClick={this.handleThresholdSwitch(ThresholdStatusCurrent === '1' ? '0' : '1', MaxThresholdCurrent, MinThresholdCurrent)} />
              </div>
            </div>
            <div styleName="row" style={{ marginTop: '1rem' }}>
              <label styleName="label">{upperBound}:&nbsp;</label>
              <div>
              <input  type="number"
              styleName={isAnyError && settingValueIsTouched['upperBound'] ? 'input-error' : ThresholdStatusCurrent === '0' ? 'input-disable' : 'input'}
              min="1" max="900"
              onBlur={this.handleBlur('upperBound')}
              disabled={ThresholdStatusCurrent === '0'}
              onChange={this.handleMaxThresholdChange}
              style={{ cursor: ThresholdStatusCurrent === '0' ? 'not-allowed' : 'text' }}
              // placeholder={this.props.MaxThresholdCurrent}
              value={MaxThresholdCurrent === null ? this.props.MaxThresholdCurrent : MaxThresholdCurrent}
              id="upper-bound" />
              </div>
            </div>
            <div styleName="row">
              <label styleName="label">{lowerBound}:&nbsp;</label>
              <div>
              <input  type="number"
              styleName={isAnyError && settingValueIsTouched['lowerBound'] ? 'input-error' :  ThresholdStatusCurrent === '0' ? 'input-disable' :  'input'}
              min="1" max="900"
              onBlur={this.handleBlur('lowerBound')}
              disabled={ThresholdStatusCurrent === '0'}
              onChange={this.handleMinThresholdChange}
              style={{ cursor: ThresholdStatusCurrent === '0' ? 'not-allowed' : 'text' }}
              // placeholder={this.props.MinThresholdCurrent}
              value={MinThresholdCurrent === null ? this.props.MinThresholdCurrent : MinThresholdCurrent}
              id="lower-option" />
              </div>
            </div>
            <div styleName="error-container">
              {
                <div styleName={isAnyError && settingValueIsTouched['upperBound'] ? 'upper-error-box' : 'upper-error-box-hidden' }>
                  {this.printErrorMsg(l, '1,900')}
                </div>
              }
              </div>
              <div styleName="error-container">
              {
                <div styleName={isAnyError && settingValueIsTouched['lowerBound'] ? 'lower-error-box' : 'lower-error-box-hidden' }>
                  {this.printErrorMsg(l, `1,${MaxThresholdCurrent}`)}
                </div>
              }
              </div>
            <div styleName="submit-row">
          <Button type="submit" style={{ cursor: ThresholdStatusCurrent === '0' ? 'not-allowed' : 'pointer' }} disabled={ThresholdStatusCurrent === '0'} onClick={this.handleSubmitThreshold}>{submit}</Button>
            </div>
          </div>
        </div>
        <div styleName="block">
          <div styleName="header">{titleSystem}</div>
          <div styleName="body">
            <Button styleName="primary" onClick={this.handleLogExport}>{logExport}</Button>
          </div>
        </div>
      </div>
    )
  }
}
