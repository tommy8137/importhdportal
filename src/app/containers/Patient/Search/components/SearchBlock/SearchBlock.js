import React, { Component, PropTypes } from 'react'
import PureRenderMixin from 'react-addons-pure-render-mixin'
import CSSModules from 'react-css-modules'
import styles from './search-block.css'
import moment from 'moment'
// don't remove, react-datepicker need it to style
import datePickerStyle from 'react-datepicker/dist/react-datepicker.css'
import DatePicker from 'react-datepicker'
import { connect } from 'react-redux'

const CONSTANT = {
  TODAY: 'TODAY',
  DURATION: 'DURATION',
}
@connect(
  state => ({
    l: (word) => state.locale.get('locale').get(word),
  })
)
@CSSModules(styles)
export default class SearchBlock extends Component {
  static propTypes = {
    dateChangeCallback: PropTypes.func,
    searchCallback: PropTypes.func,
    l: PropTypes.func,
  }

  state = {
    searchPeriod: CONSTANT.TODAY,
    startDate: moment(),
    endDate: moment(),
    queryString: '',
    searchBtnDisabled: false,
  }

  //-----------------------------------------------------------------------------
  // event handler
  //-----------------------------------------------------------------------------
  startDateChange = (date) => {
    this.setState({ startDate: date })
    const { endDate } = this.state
    this.props.dateChangeCallback({
      startDate: date.format('YYYY-MM-DD'), endDate: endDate.format('YYYY-MM-DD')
    })
  }

  endDateChange = (date) => {
    this.setState({ endDate: date })
    const { startDate } = this.state
    this.props.dateChangeCallback({
      startDate: startDate.format('YYYY-MM-DD'), endDate: date.format('YYYY-MM-DD')
    })
  }

  selectPeriod = (value) => {
    this.setState({ searchPeriod: value.target.value })
    const { startDate, endDate } = this.state
    let newStartDate = startDate
    let newEndDate = endDate
    if (value.target.value === CONSTANT.TODAY) {
      newStartDate = newEndDate = moment()
    }
    this.props.dateChangeCallback({
      startDate: newStartDate.format('YYYY-MM-DD'), endDate: newEndDate.format('YYYY-MM-DD')
    })
  }

  selectDuration = () => {
    this.setState({ searchPeriod: CONSTANT.DURATION })
    const { startDate, endDate } = this.state
    this.props.dateChangeCallback({
      startDate: startDate.format('YYYY-MM-DD'), endDate: endDate.format('YYYY-MM-DD')
    })
  }

  queryStringChange = (e) => {
    if (e.target.value.match(/[@|#|$|%|!|&|*|(|)|^|~|+|-|\'|\"]/)) {
      this.setState({ searchBtnDisabled: true })
    } else {
      this.setState({ searchBtnDisabled: false })
    }
    this.setState({ queryString: e.target.value })
  }

  onSubmit = (event) => {
    this.searchClick(event)
  }

  searchClick = (event) => {
    event.preventDefault()
    this.props.searchCallback(this.state.queryString)
  }

  //-----------------------------------------------------------------------------
  // render
  //-----------------------------------------------------------------------------
  render() {
    const { l } = this.props
    const searchBtnPostfix = (this.state.searchBtnDisabled) ? 'disabled' : 'enabled'

    return (
      <form styleName="search-table">
        <div styleName="search-table-1st-line">
          <div styleName="radio-today">
            <input onChange={this.selectPeriod} type="radio" name="period"
              value={CONSTANT.TODAY} id="today-option"
              checked={!!(this.state.searchPeriod === CONSTANT.TODAY)} />
            <label styleName="today-label" htmlFor="today-option"></label>
            <div styleName="today-text">{l(`Today's Patients`)}</div>
          </div>
          <div styleName="radio-duration" onClick={this.selectDuration}>
            <input onChange={this.selectPeriod} type="radio" name="period"
              value={CONSTANT.DURATION} id="duration-option"
              checked={!!(this.state.searchPeriod === CONSTANT.DURATION)}/>
            <label styleName="duration-label" htmlFor="duration-option"></label>
            <DatePicker
              readOnly={true}
              styleName="round-datepicker"
              dateFormat="YYYY-MM-DD"
              minDate={moment().add(-6, 'month')}
              maxDate={this.state.endDate}
              selected={this.state.startDate}
              startDate={this.state.startDate}
              endDate={this.state.endDate}
              onChange={this.startDateChange} />
            <div styleName="duration-symbol">~</div>
            <DatePicker
              readOnly={true}
              styleName="round-datepicker"
              dateFormat="YYYY-MM-DD"
              minDate={this.state.startDate}
              maxDate={moment()}
              selected={this.state.endDate}
              startDate={this.state.startDate}
              endDate={this.state.endDate}
              onChange={this.endDateChange} />
          </div>
        </div>
        <div styleName="search-table-2nd-line">
          <input styleName="search-input" type="text" placeholder={l('Enter name or ID')}
            onChange={this.queryStringChange} value={this.state.queryString}
            maxLength="30" />
          <button
            styleName={`search-button-${searchBtnPostfix}`}
            disabled={this.state.searchBtnDisabled}
            onClick={this.searchClick} >{l('Search')}</button>
        </div>
      </form>)
  }
}
