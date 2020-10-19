import React, { Component, PropTypes } from 'react'
import PureRenderMixin from 'react-addons-pure-render-mixin'

function Grid({ x1, y1, x2, y2 }) {
  return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#333" strokeDasharray="3, 3" opacity="1" />
}

export default class SBPAlarmThresholdLine extends Component {

  static propTypes = {
    left: PropTypes.number,
    right: PropTypes.number,
    // yScaleFunc: PropTypes.func,
    // upperBound: PropTypes.number,
    // lowerBound: PropTypes.number,
    tuningValue: PropTypes.number,
  };

  constructor(props) {
    super(props)
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this)
  }

  render() {
    const { left, right, yScaleFunc, upperBound, lowerBound, tuningValue } = this.props
    // const smax = yScaleFunc(upperBound)
    const tuningValueInChart = yScaleFunc(tuningValue)
    return (
      <g>
        <Grid x1={left} y1={tuningValueInChart} x2={right} y2={tuningValueInChart} />
      </g>
    )
  }
}
