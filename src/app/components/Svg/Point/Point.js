import React, { PureComponent, PropTypes } from 'react'
import Circle from 'components/Svg/Circle'
import R from 'ramda'

const xTrans = R.curry((labelAlign, point) => R.cond([
    [R.equals('right'), _ => ({
        ...point,
        x: point.x + 10,
        y: point.y
    })],
    [R.T, _ => ({ ...point, x: point.x - 10, y: point.y })],
])(labelAlign))

const yTrans = R.curry((labelAlign, point) => R.cond([
    [R.equals('right'), _ => ({ ...point, x: point.x, y: point.y })],
    [R.T, _ => {
        const { x, y, idx, fontSize} = point
        return {
            ...point,
            x: x,
            y: (idx % 2 == 0) ? (y + 2 * fontSize) : (y - fontSize),
        }
    }]
])(labelAlign))

const defaultPoint = R.merge({ x: 0, y: 0, idx: 0, fontSize: 18 })

const calculateLabelPosition = (labelPosition) => R.compose(
    yTrans(labelPosition),
    xTrans(labelPosition),
    defaultPoint
)

export default class Point extends PureComponent {
  static defaultProps = {
    component: Circle,
    customClassName: '',
    showText: true,
    showNode: true,
    labelAlign: 'default', // default | right
  }

  static propTypes = {
    x: PropTypes.number,
    y: PropTypes.number,
    value: PropTypes.number,
    idx: PropTypes.number,
    callback: PropTypes.func,
    times: PropTypes.array,
    showText: PropTypes.bool,
    width: PropTypes.number,
    stroke: PropTypes.string,
    selected: PropTypes.bool,
    customClassName: PropTypes.string,
    selectedLabelStyle: PropTypes.object,
    showNode: PropTypes.bool,
    labelAlign: PropTypes.string,
  }

  state = {
    fontSize: 14
  }

  enter = () => {
    this.setState({
      fontSize: 18
    })
  }

  leave = () => {
    this.setState({
      fontSize: 14,
    })
  }

  click = () => {
    const { idx, callback, times } = this.props
    if (typeof callback === 'function') {
      callback(times[idx], idx)
    }
  }

  render() {
    const { x, y, value, idx } = this.props
    const { fontSize } = this.state
    const {
      width,
      stroke,
      selected,
      customClassName,
      selectedLabelStyle,
      showNode,
      showText,
      labelAlign
    } = this.props

    const { x: textX, y: textY } = calculateLabelPosition(labelAlign)({ x, y, idx, fontSize })
    const tStyle = selected? selectedLabelStyle: null
    const text = (
      <text x={textX} y={textY} fontSize={this.state.fontSize} fill="#333" {...tStyle} >
        {value}
      </text>
    )

    const node = (
      <this.props.component
        x={x}
        y={y}
        strokeWidth={width}
        stroke={stroke}
        fill={stroke}
        selected={selected}
        customClassName={customClassName}/>
    )

    return (
      <g onClick={this.click} onMouseEnter={this.enter} onMouseLeave={this.leave}>
        {showNode && showText && text}
        {showNode && node}
      </g>
    )
  }
}
