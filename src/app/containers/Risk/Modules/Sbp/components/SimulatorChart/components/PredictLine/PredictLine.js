import React, { Component, PropTypes } from 'react'
import Line from 'components/Svg/Line'
import FillArea from './FillArea'
import PureRenderMixin from 'react-addons-pure-render-mixin'

export default class PredictLine extends Component {
  static statics = {
    borderWidth: 2,
  }
  static propTypes = {
    uprPoints: PropTypes.array,
    lwrPoints: PropTypes.array,
    color: PropTypes.string,
    opacity: PropTypes.number,
    speed: PropTypes.number,
  }
  static defaultProps = {
    speed: 1,
  }

  constructor(props) {
    super(props)
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this)
  }

  render() {
    const { uprPoints, lwrPoints, upUprPoints, lwLwrPoints, color, opacity, speed } = this.props
    const { xScale, yScale } = this.props
    const { borderWidth } = PredictLine.statics
    return (
      <g>
        {upUprPoints && <Line
          points={upUprPoints}
          type="dash"
          width={borderWidth}
          stroke={color}
          speed={speed}
          xScale={xScale}
          yScale={yScale}/>}
        {lwLwrPoints && <Line
          points={lwLwrPoints}
          type="dash"
          width={borderWidth}
          stroke={color}
          speed={speed}
          xScale={xScale}
          yScale={yScale}/>}
        {uprPoints && <Line
          points={uprPoints}
          type="solid"
          width={borderWidth}
          stroke={color}
          speed={speed}
          xScale={xScale}
          yScale={yScale}/>}
        {lwrPoints && <Line
          points={lwrPoints}
          type="solid"
          width={borderWidth}
          stroke={color}
          speed={speed}
          xScale={xScale}
          yScale={yScale}/>}
        {uprPoints && lwrPoints && <FillArea
          pointsUp={uprPoints}
          pointsBottom={lwrPoints}
          color={color}
          opacity={opacity}
          speed={speed}
          xScale={xScale}
          yScale={yScale}/>}
      </g>
    )
  }
}
