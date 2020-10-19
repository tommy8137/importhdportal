import React, { Component, PropTypes } from 'react'
import PureRenderMixin from 'react-addons-pure-render-mixin'

function Grid({ x1, y1, x2, y2 }) {
  return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="black" strokeDasharray="3, 3" opacity="0.5" />
}

export default class YGridLine extends Component {

  static propTypes = {
    left: PropTypes.number,
    right: PropTypes.number,
    yScaleFunc: PropTypes.func,
    upperBound: PropTypes.number,
    lowerBound: PropTypes.number,
  };

  constructor(props) {
    super(props)
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this)
  }

  render() {
    const { left, right, yScaleFunc, upperBound, lowerBound } = this.props
    const smax = yScaleFunc(upperBound)
    const smin = yScaleFunc(lowerBound)
    return (
      <g>
        <Grid x1={left} y1={smin} x2={right} y2={smin}/>
        <Grid x1={left} y1={smax} x2={right} y2={smax}/>
      </g>
    )
  }
}
