// ----------------------------------------------------------------------------
// external libraries
// ----------------------------------------------------------------------------
import React, { Component } from 'react'
import CSSModules from 'react-css-modules'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import Modal from 'react-modal'
import moment from 'moment'
import Select from 'react-select'
// ----------------------------------------------------------------------------
// images
// ----------------------------------------------------------------------------

// ----------------------------------------------------------------------------
// styles
// ----------------------------------------------------------------------------
import styles from './alarm-phrase-modal.css'
import modalStyles from 'containers/Root/modal.css'
// ----------------------------------------------------------------------------
// internal dependencies
// ----------------------------------------------------------------------------
import { submitAlarmPharseSAC } from './actions'
import selector from './selector'

@connect(
  selector,
  (dispatch) => ({
    actions: bindActionCreators({
      submitAlarmPharseSAC,
    }, dispatch),
  })
)
@CSSModules(styles)
export default class AlarmPharseModal extends Component {
  state = {
    pharseIdx: 0,
    processIdx: 0,
    processHour: moment().format('hh'),
    processMinute: moment().format('mm'),
    processAtAMorPM: moment().format('A'),
    isDescriptionEditing: false,
    descriptionAfterModify: '',
  }

  selectAlarmPharse = (value) => {
    return (e) => {
      if (this.state.isDescriptionEditing === false) {
        if (value != this.state.pharseIdx) {
          // reset the second item (treatment desc) when change pharse
          this.setState({
            processIdx: 0,
          })
        }
        this.setState({
          pharseIdx: value,
        })
      }
    }
  }

  selectAlarmProcess = (selection) => {
    this.setState({
      processIdx: selection.value,
    })
  }

  getDropDownItems = () => {
    const { pharseIdx } = this.state
    const { notesformat, modal } = this.props
    let pharseItems = null

    switch(notesformat) {
      case 'dart':
        pharseItems = modal.get('content').DartLists
        return {
          pharseItems,
          processItems: pharseItems[pharseIdx].AContent.map((process, idx) => {
            return { value: idx, label: process }
          }),
          ev_situation: pharseItems[pharseIdx].DContent,
          Subject: pharseItems[pharseIdx].Subject,
        }
      case 'soap':
      default: {
        pharseItems = modal.get('content').AlarmLists
        return {
          pharseItems,
          processItems: pharseItems[this.state.pharseIdx].alarm_process.map((process, idx) => {
            return { value: idx, label: process }
          }),
          ev_situation: pharseItems[pharseIdx].alarm_phrase,
        }

      }
    }

  }

  submit = (e) => {
    const { modal } = this.props
    const { processIdx, pharseIdx, processHour, processMinute, processAtAMorPM } = this.state
    const { isDescriptionEditing, descriptionAfterModify } = this.state
    const { notesformat } = this.props

    const { processItems, ev_situation, Subject } = this.getDropDownItems()

    const todayString = moment().startOf('day').format('YYYY-MM-DD')

    let submitArguments = { }
    const sbp_time = modal.get('content').selectedTime
    const ev_time = moment(`${todayString} ${processHour}:${processMinute} ${processAtAMorPM}`, 'YYYY-MM-DD hh:mm A').format('YYYY-MM-DD HH:mm')
    const ev_process = isDescriptionEditing ? descriptionAfterModify : processItems[processIdx].label
    if (notesformat !== 'dart') {
      submitArguments = {
        sbp_time,
        ev_situation,
        ev_process,
        ev_time,
      }
    } else {
      submitArguments  = {
        sbp_time,
        Subject,
        DContent: ev_situation,
        AContent: ev_process,
        RContent: '',
        TContent: '',
        Process_Date: ev_time,
      }
    }

    this.props.actions.submitAlarmPharseSAC(submitArguments, notesformat)
  }

  changeToday = () => {}

  changeProcessHour = (selection) => {
    this.setState({ processHour: selection.value })
  }
  changeProcessMinute = (selection) => {
    this.setState({ processMinute: selection.value })
  }

  changeProcessAtAMorPM = (selection) => {
    this.setState({ processAtAMorPM: selection.value })
  }

  initSelectorArray = (count) => {
    return  Array.from({ length: count }, (value, idx) => {
      let string = String(idx)

      if (idx < 10) {
        string = `0${idx}`
      }

      if (count == 12 && idx == 0) {
        string = '12'
      }

      return {
        value: string,
        label: string,
      }
    })
  }

  descriptionModify = (e) => {
    this.setState({ descriptionAfterModify: e.target.value })
  }

  toggleDescription = () => {
    const { isDescriptionEditing, processIdx } = this.state
    const { processItems } = this.getDropDownItems()

    if (!isDescriptionEditing) {
      // go to edit
      this.setState({ descriptionAfterModify: processItems[processIdx].label })
    } else {
      // exit edit
      this.setState({ descriptionAfterModify: null })
    }
    this.setState({ isDescriptionEditing: !isDescriptionEditing })

  }

  render() {
    const { modal, l, closeModal, notesformat } = this.props
    const today = moment().format('YYYY-MM-DD')
    const { isDescriptionEditing } = this.state
    // prepare selector options
    const hourArray = this.initSelectorArray(12)
    const minuteArray = this.initSelectorArray(60)

    const { pharseItems, processItems } = this.getDropDownItems()

    let {
      ['modal-content']: contentClass,
      ['modal-container']: modalContainer,
      ['overlay-class']: overlayClass,
      ['modal-title']: modalTitle,
      ['icon-close']: iconClose,
      ['button-confirm']: btnClass,
    } = modalStyles

    let modalClass = styles['pharse-modal-class']
    return (
      <Modal
        isOpen={modal.get('visible')}
        className={modalClass}
        overlayClassName={overlayClass}
        onRequestClose={closeModal}
        closeTimeoutMS={300}
        contentLabel="Modal">
        {
          <section styleName="container-section">
            <section styleName="alarm-pharse-section">
              <section styleName="header-section">
                <span>{l('Treatment of Warning')}</span>
                <div styleName="close-botton" onClick={closeModal}>
                  <span>{'X'}</span>
                </div>
              </section>
              <Seperator />
              <section styleName="body-section">
              {
                pharseItems.map((bar, idx) => {
                  return (
                    <div
                      styleName="pharse-row"
                      key={`radio-option-${idx}`}>
                      <input onChange={this.selectAlarmPharse(idx)}
                        styleName="radio-input"
                        type="radio"
                        name="period"
                        value={idx}
                        data={bar.label}
                        id={`radio-option-${idx}`}
                        checked={this.state.pharseIdx == idx} />
                      <label styleName="radio-label" htmlFor={`radio-option-${idx}`}></label>
                      <div
                        styleName={(this.state.pharseIdx == idx) ? 'pharse-items' : 'pharse-items-blur' }
                        key={idx}
                        onClick={this.selectAlarmPharse(idx)}>
                        {
                          (notesformat !== 'dart') ? bar.alarm_phrase : bar.DContent
                        }
                      </div>
                    </div>
                  )
                })
              }
              </section>
            </section>
            <section styleName="alarm-process-section">
              <section styleName="header-section">
                <span>{l('Treatment Description')}</span>
              </section>
              <Seperator />
              <section styleName="body-section">
                {isDescriptionEditing ?
                  <input styleName="edit-input" type="text"
                    onChange={this.descriptionModify} value={this.state.descriptionAfterModify} /> :
                  <Select
                  clearable={false}
                  searchable={false}
                  placeholder={l('Please Select')}
                  styleName="alarm-process-selector"
                  options={processItems}
                  value={this.state.processIdx}
                  onChange={this.selectAlarmProcess} />
                }
                {
                  isDescriptionEditing ?
                    <button styleName="cancel-button" onClick={this.toggleDescription}>{l('Cancel')}</button>:
                    <button styleName="edit-button" onClick={this.toggleDescription}>{l('Edit')}</button>
                }
              </section>
            </section>
            <section styleName="alarm-process-time-section">
              <section styleName="header-section">
                <span>{l('Treatment Time')}</span>
              </section>
              <Seperator />
              <section styleName="body-section">
                <Select
                  clearable={false}
                  searchable={false}
                  placeholder={l('Please Select')}
                  styleName="alarm-process-time-selector"
                  options={[{ value: today, label: today }]}
                  value={today}
                  onChange={this.changeToday} />
                <Select
                  clearable={false}
                  searchable={false}
                  placeholder={l('Please Select')}
                  styleName="alarm-process-time-selector"
                  options={hourArray}
                  value={this.state.processHour}
                  onChange={this.changeProcessHour} />
                <Select
                  clearable={false}
                  searchable={false}
                  placeholder={l('Please Select')}
                  styleName="alarm-process-time-selector"
                  options={minuteArray}
                  value={this.state.processMinute}
                  onChange={this.changeProcessMinute} />
                <Select
                  clearable={false}
                  searchable={false}
                  placeholder={l('Please Select')}
                  styleName="alarm-process-time-selector"
                  options={[{ value: 'AM', label: 'AM' }, { value: 'PM', label: 'PM' }]}
                  value={this.state.processAtAMorPM}
                  onChange={this.changeProcessAtAMorPM} />
              </section>
            </section>
            <Seperator />
            <section styleName="button-section">
              <button
                styleName="primary-green-button"
                onClick={this.submit}>
                  {l('Confirm')}
              </button>
            </section>
          </section>
        }
      </Modal>
    )
  }
}

@CSSModules(styles)
class Seperator extends Component {
  render () {
    return (
    <div styleName="seperator">
    </div>
    )
  }
}
