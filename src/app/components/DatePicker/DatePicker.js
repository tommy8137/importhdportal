import React, { Component, PropTypes } from 'react'
import styles from './style.css'
import moment from 'moment'
import Select from 'react-select'
import CSSModules from 'react-css-modules'

@CSSModules(styles)
export default class DatePicker extends Component {
  static propTypes = {
    records: PropTypes.array,
    currentRecord: PropTypes.object,
    clickTimeCallback: PropTypes.func,
  }

  dateMove = (unit) => {
    const { records, currentRecord, clickTimeCallback } = this.props
    if (typeof clickTimeCallback !== 'function') {
      return
    }

    const filtered = records.filter((r) => r.value === currentRecord.get('r_id'))
    if (filtered.length <= 0) {
      return
    }
    const selected = filtered[0]
    const currentIndex = records.indexOf(selected)
    clickTimeCallback(records[currentIndex + unit].value)
  }

  //-------------------------------------------------------------------------
  // dropdown change handler
  // argument format: newTime { value: new Date().valueOf(), label: 'YYYY-MM-DD' }
  //-------------------------------------------------------------------------
  dateChange = (selected, idx) => {
    const { clickTimeCallback } = this.props
    if (typeof clickTimeCallback === 'function') {
      clickTimeCallback(selected.value)
    }
  }

  render() {
    const { currentRecord, records } = this.props
    const isToday = currentRecord && moment(currentRecord.get('date')).format('YYYY MM DD') === moment().format('YYYY MM DD')
    const isOldest = records && records.length > 0 && currentRecord
      ? currentRecord.get('r_id') == records[0].r_id
      : false
    const currentValue = currentRecord? currentRecord.get('r_id'): null
    let selectorStyle = isToday? null: 'history-bg'
    let arrowLeft = !currentRecord || records.length == 0 || currentRecord.get('r_id') === records[0].value
      ? 'invisible'
      : null
    let arrowRight = !currentRecord || records.length == 0 || currentRecord.get('r_id') === records[records.length - 1].value
      ? 'invisible'
      : null
    // a weird bug as some record is selected by the user, menu always being scrolled to the top.
    return (
      <span styleName={selectorStyle}>
        <div styleName="date-picker">
          <i styleName={arrowLeft} className="caret left icon big" onClick={this.dateMove.bind(this, -1)}></i>
            <div styleName="current-pick">
              <Select
                key={currentValue}
                name="select-date"
                styleName="select-value"
                className="selectBody"
                clearable={false}
                searchable={false}
                disabled={!currentValue && !records}
                placeholder={''}
                value={currentValue}
                options={records}
                onChange={this.dateChange}/>
            </div>
          <i styleName={arrowRight} className="caret right icon big" onClick={this.dateMove.bind(this, 1)}></i>
        </div>
      </span>
    )
  }
}
