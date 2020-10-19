import React, { Component, PropTypes } from 'react'
import Gauge from './components/Gauge'
import CSSModules from 'react-css-modules'
import styles from './sbp-board.css'
import PureRenderMixin from 'react-addons-pure-render-mixin'
import ImmutablePropTypes from 'react-immutable-proptypes'
import { fromJS } from 'immutable'

@CSSModules(styles)
export default class SbpBoard extends Component {
  constructor(props) {
    super(props)
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this)
  }

  static propTypes = {
    predictions: ImmutablePropTypes.list,
    simulations: ImmutablePropTypes.list,
  }

  static defaultProps = {
    predictions: fromJS([]),
    simulations: fromJS([]),
  }

  render() {
    const { width, height, selectedTime } = this.props
    const { titlePrefix, titleSuffix, condition } = this.props
    const { predictions, simulations } = this.props
    let time1, time2, time3, time4
    if (selectedTime) {
      const min30 = 1000 * 60 * 30
      time1 = selectedTime
      time2 = time1 + min30
      time3 = time2 + min30
      time4 = time3 + min30
    } else {
      time1 = 0
      time2 = 0
      time3 = 0
      time4 = 0
    }
    return (
      <div styleName="container">
        <div styleName="board">
          <Gauge time={time1} predictProb={predictions.get(0)} simulateProb={simulations.get(0)}/>
          <Gauge time={time2} predictProb={predictions.get(1)} simulateProb={simulations.get(1)}/>
          <Gauge time={time3} predictProb={predictions.get(2)} simulateProb={simulations.get(2)}/>
          <Gauge time={time4} predictProb={predictions.get(3)} simulateProb={simulations.get(3)}/>
        </div>
        {
          condition
          ? (
            <div styleName="title">
              <span>{titlePrefix}</span>
              <span styleName="condition">{condition}</span>
              <span>{titleSuffix}</span>
            </div>)
          : <div styleName="title"></div>
        }
      </div>
    )
  }
}
