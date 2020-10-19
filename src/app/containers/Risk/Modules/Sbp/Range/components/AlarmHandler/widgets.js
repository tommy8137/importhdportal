// ----------------------------------------------------------------------------
// external libraries
// ----------------------------------------------------------------------------
import React, { Component } from 'react'
import CSSModules from 'react-css-modules'
// ----------------------------------------------------------------------------
// images
// ----------------------------------------------------------------------------
import PROCESS_PHARSE_INFO from  './images/circle-alert-orange-hollow.png'
// ----------------------------------------------------------------------------
// styles
// ----------------------------------------------------------------------------
import styles from './alarm-handler.css'
// ----------------------------------------------------------------------------
// internal dependencies
// ----------------------------------------------------------------------------



@CSSModules(styles)
export class AlarmStatus extends Component {
  state = {
    processIconDisplay: false,
  }

  onMouseEnter = (e) => {
    this.setState({ processIconDisplay: true })
  }

  onMouseLeave = (e) => {
    this.setState({ processIconDisplay: false })
  }

  render() {
    const { processIconDisplay } = this.state
    const {
      statusIcon,
      title,
      status,
      isProcessed,
      alarmPhrase,
      alarmProcess,
      processTime,
      textStyle,
      notesformat,
      Subject,
      DContent,
      AContent,
      RContent,
      TContent,
      l,
    } = this.props

    return (
      <section styleName="alarm-status">
        <section styleName="icon">
          <img src={statusIcon} />
        </section>
        <section styleName={textStyle}>
          <section styleName="title">
            <span>{title}</span>
            {
              (isProcessed) &&
              <img
                styleName="processIcon"
                src={PROCESS_PHARSE_INFO}
                onMouseEnter={this.onMouseEnter}
                onMouseLeave={this.onMouseLeave} />
            }
            {
              (isProcessed && processIconDisplay) && (
                (notesformat !== 'dart') ? (
                  <section styleName="process-info">
                    <div styleName="processContent">
                      <div styleName="pharse-title">{l('Treatment of Warning')}</div>
                      <div styleName="pharse-detail">{alarmPhrase}</div>
                      <div></div>
                      <div styleName="process-title">{l('Treatment Description')}</div>
                      <div styleName="process-detail">{alarmProcess}</div>
                      <div></div>
                      <div styleName="process-title">{l('Treatment Time')}</div>
                      <div styleName="process-detail">{processTime}</div>
                    </div>
                  </section>
                ) : (
                  <section styleName="process-info">
                    <div styleName="processContent">
                      <div styleName="pharse-title">{`${Subject}`}</div>
                      <div styleName="pharse-title">{'Data:'}</div>
                      <div styleName="pharse-detail">{`${DContent}`}</div>
                      <div></div>
                      <div styleName="process-title">{'Action:'}</div>
                      <div styleName="process-detail">{`${AContent}`}</div>
                      <div></div>
                      <div styleName="process-title">{'Response:'}</div>
                      <div styleName="process-detail">{`${RContent}`}</div>
                      <div></div>
                      <div styleName="process-title">{'Teaching:'}</div>
                      <div styleName="process-detail">{`${TContent}`}</div>
                    </div>
                  </section>
                )
              )
            }
          </section>
          <div styleName="status">{status}</div>
        </section>
      </section>
    )
  }
}
