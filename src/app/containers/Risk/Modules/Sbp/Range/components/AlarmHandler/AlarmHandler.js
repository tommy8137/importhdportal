// ----------------------------------------------------------------------------
// external libraries
// ----------------------------------------------------------------------------
import React, { Component } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import CSSModules from 'react-css-modules'
import moment from 'moment'
// ----------------------------------------------------------------------------
// images
// ----------------------------------------------------------------------------
import NO_WARN_MSG from './images/no-warn-msg.png'
import NOT_PROCESSED_YET from './images/triangle-alert-red.png'
import KEEP_OBSERVE from './images/observe.png'
import PROCESSED from  './images/circle-alert-orange.png'
import NO_RISK from './images/circle-ok-green.png'
import PROCESS_PHARSE_INFO from  './images/circle-alert-orange-hollow.png'
// ----------------------------------------------------------------------------
// styles
// ----------------------------------------------------------------------------
import styles from './alarm-handler.css'
// ----------------------------------------------------------------------------
// internal dependencies
// ----------------------------------------------------------------------------
import { showAlarmPharseModalSAC } from '../AlarmPhraseModal'
import selector from './selector'
import { AlarmStatus } from './widgets'
import { keepObserveSAC } from './actions'

@connect(
  selector,
  (dispatch) => ({
    actions: bindActionCreators({
      showAlarmPharseModalSAC,
      keepObserveSAC,
    }, dispatch),
  })
)
@CSSModules(styles)
export default class AlarmHandler extends Component {
  static STATUS_ICON_TABLE = new Map([
    ['NO_WARN_MSG', NO_WARN_MSG],
    ['NOT_PROCESSED_YET', NOT_PROCESSED_YET],
    ['KEEP_OBSERVE', KEEP_OBSERVE],
    ['PROCESSED', PROCESSED],
    ['NO_RISK', NO_RISK],
  ])

  observeHandler = () => {
    const selectedTime = moment(this.props.selectedTime, 'x').format('YYYY-MM-DD HH:mm:ss')
    this.props.actions.keepObserveSAC(selectedTime, this.props.notesformat)
  }

  treatHandler = () => {
    const selectedTime = moment(this.props.selectedTime, 'x').format('YYYY-MM-DD HH:mm:ss')
    this.props.actions.showAlarmPharseModalSAC(selectedTime)
  }

  render() {
    const {
      l,
      alarmInfo,
      Subject,
      DContent,
      AContent,
      RContent,
      TContent,
      notesformat
    } = this.props
    const {
      alarmPhrase,
      alarmProcess,
      buttonDisplay,
      isBlur,
      observeBtnDisable,
      processBtnDisable,
      status,
      statusCode2Str,
      textStyle,
      title,
      isProcessed,
      processTime,
    } = alarmInfo

    // get status string, to look up corresponding icon
    let statusIcon = AlarmHandler.STATUS_ICON_TABLE.get(statusCode2Str)
    return (
      <section styleName="container">
        <section styleName="status-container">
          {(isBlur) && <div styleName="blur-layer"></div>}
          <AlarmStatus
            statusIcon={statusIcon}
            title={title}
            status={status}
            textStyle={textStyle}
            isProcessed={isProcessed}
            alarmPhrase={alarmPhrase}
            alarmProcess={alarmProcess}
            processTime={processTime}
            notesformat={notesformat}
            Subject={Subject}
            DContent={DContent}
            AContent={AContent}
            RContent={RContent}
            TContent={TContent}
            l={l} />
        </section>
        {
          (buttonDisplay) && (
            <section styleName="buttons" style={{ marginLeft: -40 }}>
              <button
                styleName="primary-green-button"
                disabled={observeBtnDisable}
                onClick={this.observeHandler} >
                {l('Continue Observe')}
              </button>
              <button
                styleName="primary-green-button"
                disabled={processBtnDisable}
                onClick={this.treatHandler} >
                {l('Treatment')}
              </button>
            </section>
          )
        }
      </section>
    )
  }
}
