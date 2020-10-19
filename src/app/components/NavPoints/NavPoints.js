import React, { Component, PropTypes } from 'react'
import CSSModules from 'react-css-modules'
import styles from './navpoints.css'
import { maybe } from 'maybes'
import R from 'ramda'

@CSSModules(styles)
export default class NavPoints extends Component {
  static propTypes = {
    l : PropTypes.func,
    selectedTime: PropTypes.number,
    distinctTimes: PropTypes.array,
    selectTime: PropTypes.func,
  }
  static defaultProps = {
    distinctTimes: [],
  }

  handleNext = (e) => {
    const { l, selectedTime, distinctTimes, selectTime } = this.props
    const newTime = maybe(distinctTimes)
      .map(dts => dts.filter(time => time > selectedTime))
      .filter(dts => dts.length > 0)
      .map(dts => dts[0])
      .orJust(selectedTime)

    selectTime(newTime)
  }

  handlePrev = (e) => {
    const { l, selectedTime, distinctTimes, selectTime } = this.props
    const newTime = maybe(distinctTimes)
      .map(dts => dts.filter(time => time < selectedTime))
      .filter(dts => dts.length > 0)
      .map(dts => dts[dts.length - 1])
      .orJust(selectedTime)

    selectTime(newTime)
  }

  render() {
    const { l, selectedTime, distinctTimes } = this.props
    const dts = maybe(distinctTimes)
    const disablePrev = dts
      .map(dts => dts.filter(time => time < selectedTime))
      .map(dts => dts.length <= 0)
      .orJust(true)
    const disableNext = dts
      .map(dts => dts.filter(time => time > selectedTime))
      .map(dts => dts.length <= 0)
      .orJust(true)

    return (
      <div styleName="container">
        <button styleName="btn" onClick={this.handlePrev} disabled={disablePrev}>
          <i styleName="arrow-left" className="caret left icon"/>
          {l('Previous')}
        </button>
        <button styleName="btn" onClick={this.handleNext} disabled={disableNext}>
          {l('Next')}
          <i styleName="arrow-right" className="caret right icon"/>
        </button>
      </div>
    )
  }
}
