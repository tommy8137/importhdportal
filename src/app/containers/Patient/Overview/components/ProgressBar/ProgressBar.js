import React, { Component, PropTypes } from 'react'
import PureRenderMixin from 'react-addons-pure-render-mixin'
import { Motion, spring } from 'react-motion'

//-----------------------------------------------------------------------------
// Wrap by react-motion
//-----------------------------------------------------------------------------
export default class MotionProgressBar extends Component {
  //-----------------------------------------------------------------------------
  // constant
  //-----------------------------------------------------------------------------
  static statics = {
    HEIGHT: 15,
    MOTION_OPTION: { stiffness: 30, damping: 15, precision: 0.1 }
  }

  static propTypes = {
    name: PropTypes.string.isRequired,
    totalLength: PropTypes.number,
    finishPercent: PropTypes.number,
    finishColor: PropTypes.string,
    unFinishColor: PropTypes.string,
  }

  render() {
    const { HEIGHT, MOTION_OPTION } = MotionProgressBar.statics
    const { name, totalLength, finishPercent, finishColor, unFinishColor } = this.props
    return (
      <Motion defaultStyle={{ x: 0 }} style={{ x: spring(finishPercent, MOTION_OPTION) }}>
        {interpolatingStyle =>
          <ProgressBar name={name} width={totalLength}
            percent={interpolatingStyle.x}
            finishColor={finishColor} unFinishColor={unFinishColor} height={HEIGHT} />
        }
      </Motion>
    )
  }
}


//-----------------------------------------------------------------------------
// Component
//-----------------------------------------------------------------------------
class ProgressBar extends Component {
  //-----------------------------------------------------------------------------
  // constant
  //-----------------------------------------------------------------------------
  static statics = {
    ROTATE_DEGREE: -60
  }

  static defaultProps = {
    // dynamic data
    percent: 0,
    // size props
    width: 0,
    height: 15,
    padding: 2,
    borderStroke: 1,
    finishColor: '#f0c',
    unFinishColor: '#fc0',
  }

  static propTypes = {
    name: PropTypes.string.isRequired,
    // size props
    width: PropTypes.number,
    height: PropTypes.number,
    padding: PropTypes.number,
    borderStroke: PropTypes.number,
    // dynamic data
    percent: PropTypes.number,
    // color, background setting
    finishColor: PropTypes.string,
    unFinishColor: PropTypes.string,
  }

  constructor(props) {
    super(props)
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this)
  }

  //-----------------------------------------------------------------------------
  // render methods
  //-----------------------------------------------------------------------------
  calculateFixedInfo = () => {
    const { height, padding, borderStroke } = this.props
    const halfBorderStroke = borderStroke / 2
    const insideBorderOffset = halfBorderStroke + padding
    const insideBarHeight = height
    const barHeight = insideBarHeight + padding * 2
    const svgHeight = barHeight + borderStroke
    return { halfBorderStroke, insideBorderOffset, insideBarHeight, barHeight, svgHeight }
  }

  calculateDynamicInfo = (percent, insideBorderOffset) => {
    const { width, padding, borderStroke } = this.props
    const insideBarLength = width
    const barLength = insideBarLength + padding * 2
    const svgWidth = barLength + borderStroke
    const fillSpaceLength = insideBarLength - padding

    let finishPartLength = 0
    let unFinishPartStart = 0
    let unFinishPartLength = 0

    if (percent !== undefined) {
      finishPartLength = percent / 100 * fillSpaceLength + insideBorderOffset
      unFinishPartStart = finishPartLength + padding
      unFinishPartLength = (100 - percent) / 100 * fillSpaceLength
    } else {
      finishPartLength = padding
      unFinishPartStart = finishPartLength + padding
      unFinishPartLength = insideBarLength - finishPartLength + padding
    }

    return { insideBarLength, barLength, svgWidth,
      finishPartLength, unFinishPartStart, unFinishPartLength }
  }

  //-----------------------------------------------------------------------------
  // render
  //-----------------------------------------------------------------------------
  render() {
    const { ROTATE_DEGREE } = ProgressBar.statics
    const { finishColor, unFinishColor, percent } = this.props
    const { borderStroke } = this.props

    const {
      halfBorderStroke,
      insideBorderOffset,
      insideBarHeight,
      barHeight,
      svgHeight,
    } = this.calculateFixedInfo()

    const {
      insideBarLength,
      barLength,
      svgWidth,
      finishPartLength,
      unFinishPartStart,
      unFinishPartLength,
    } = this.calculateDynamicInfo(percent, insideBorderOffset)

    return (
      <svg width={svgWidth} height={svgHeight} >
        <defs>
          <pattern id={`green-bar-${this.props.name}`}
            width="2.5" height={insideBarHeight}
            patternUnits="userSpaceOnUse"
            patternTransform={`rotate(${ROTATE_DEGREE})`} >
            <line stroke={finishColor} strokeWidth="3px" y2={insideBarHeight} />
          </pattern>
          <pattern id={`grey-bar-${this.props.name}`}
            width="2.5" height={insideBarHeight}
            patternUnits="userSpaceOnUse"
            patternTransform={`rotate(${ROTATE_DEGREE})`}>
            <line stroke={unFinishColor} strokeWidth="3px" y2={insideBarHeight} />
          </pattern>
          <clipPath id={`grey-cut-${this.props.name}`}>
            <rect x={unFinishPartStart} y="0" width={unFinishPartLength}
              height={insideBarHeight / Math.cos(Math.PI / 180 * (ROTATE_DEGREE))} />
          </clipPath>
          <clipPath id={`green-cut-${this.props.name}`}>
            <rect x="0" y="0" width={finishPartLength}
              height={insideBarHeight / Math.cos(Math.PI / 180 * (ROTATE_DEGREE))} />
          </clipPath>
        </defs>

        <rect x={halfBorderStroke} y={halfBorderStroke} rx={barHeight / 2} ry={barHeight / 2}
          width={barLength} height={barHeight}
          fillOpacity="0"
          stroke="#aaa" strokeWidth={borderStroke} />
        <rect x={insideBorderOffset} y={insideBorderOffset} rx={insideBarHeight / 2} ry={insideBarHeight / 2}
          width={insideBarLength} height={insideBarHeight}
          strokeOpacity="0"
          clipPath={`url(#green-cut-${this.props.name})`}
          fill={`url(#green-bar-${this.props.name})`} />
        <rect x={insideBorderOffset} y={insideBorderOffset} rx={insideBarHeight / 2} ry={insideBarHeight / 2}
          width={insideBarLength} height={insideBarHeight}
          strokeOpacity="0"
          clipPath={`url(#grey-cut-${this.props.name})`}
          fill={`url(#grey-bar-${this.props.name})`} />
      </svg>
    )
  }
}
