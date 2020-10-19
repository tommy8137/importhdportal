import React, { PureComponent, PropTypes } from 'react'
import { Motion, spring } from 'react-motion'
import { path as d3Path } from 'd3-path'
import { linearInterpolator } from '../hack-spring100-to-linear'
import transitionStyle from './transition.css'
import ReactCSSTransitionGroup from 'react-addons-css-transition-group'
import Point from 'components/Svg/Point'

export default class Line extends PureComponent {
  static defaultProps = {
    symbol: {}, // the global symbol for all array
    symbols: [],
    selectedNodes: [],
    visibleNodes: [],
    speed: 1,
    xScale: x => x,
    yScale: y => y,
  }

  static propTypes = {
    points: PropTypes.array, // after scale ( x and y values)
    values: PropTypes.array, // before scale (y values)
    callback: PropTypes.func,
    times: PropTypes.array,
    symbol: PropTypes.object,
    type: PropTypes.string,
    width: PropTypes.number,
    stroke: PropTypes.string,
    selectedNodes: PropTypes.array,
    animationCompletedCallback: PropTypes.func,
    speed: PropTypes.number,
    symbols: PropTypes.array,
    xScale: PropTypes.func.isRequired,
    yScale: PropTypes.func.isRequired,
  }

  state = {
    mappedPts: [],
    ys: {},
  }

  constructor(props) {
    super(props)
  }

  componentWillMount() {
    this.componentWillReceiveProps(this.props)
  }

  componentWillReceiveProps(newProps) {
    const { xScale, yScale, points } = newProps
    if (points.length < 1) {
      return null
    }

    const mappedPts = points.map(pt =>({ x: xScale(pt.x), y: yScale(pt.y) }))
    const ys = mappedPts.reduce((acc, p, i) => {
      acc[i] = spring(p.y, { precision: 1, stiffness: 320, damping: 25  })
      return acc
    }, {})
    this.setState({ mappedPts, ys })
  }

  getInterpolatedY(x, currentStep, points, ys) {
    if (currentStep >= points.length - 1) {
      return ys[points.length - 1]
    }

    const p0 = points[currentStep]
    const p1 = points[currentStep + 1]
    const y0 = ys[currentStep]
    const y1 = ys[currentStep + 1]
    return y0 + (y1 - y0) / (p1.x - p0.x) * (x - p0.x)
  }

  updateStep(x, points) {
    for (let i = 0; i < points.length - 1; i++) {
      if (x >= points[i].x && x < points[i + 1].x) {
        return i
      }
    }
    return points.length - 1
  }

  renderCircle(currentStep) {
    const circles = []
    const { points, values, callback, times, xScale, yScale } = this.props
    const { width, stroke, selectedNodes, symbol, symbols } = this.props
    if (!values) {
      return null
    }
    for (let idx = 0; idx <= currentStep; idx++) {
      const s = Object.assign({ showNode: true }, symbol, symbols[idx])
      if (s && s.showNode) {
        circles.push(
          <g key={`circle-${idx}`}>
            <ReactCSSTransitionGroup
              component="g"
              transitionAppear={true}
              transitionName={transitionStyle}
              transitionAppearTimeout={500}
              transitionEnterTimeout={500}
              transitionLeaveTimeout={500}>
              {
                <Point
                  {...s}
                  selected={selectedNodes.indexOf(idx) > -1}
                  width={width}
                  stroke={stroke}
                  x={xScale(points[idx].x)}
                  y={yScale(points[idx].y)}
                  idx={idx}
                  callback={callback}
                  times={times}
                  value={values[idx]}/>
              }
            </ReactCSSTransitionGroup>
          </g>)
      }
    }
    return circles
  }

  render() {
    const { points, animationCompletedCallback, speed } = this.props
    const { xScale } = this.props
    if (points.length < 1) {
      return null
    }

    const { type, width, stroke } = this.props
    const { mappedPts, ys } = this.state

    const animateAtX = (ys) =>
      <Motion
        defaultStyle={{ intX: points[0].x }}
        style={{ intX: spring(points[points.length - 1].x, { stiffness: 100 }) }}
        onRest={animationCompletedCallback}
      >
        {({ intX }) => {
          const mappedX = xScale(intX)
          const x0 = mappedPts[0].x
          const ratio = (mappedX - x0) / (mappedPts[mappedPts.length - 1].x - x0) * 100
          const x = linearInterpolator(mappedPts, ratio, 100, speed)
          const currentStep = this.updateStep(x, mappedPts)
          const y = this.getInterpolatedY(x, currentStep, mappedPts, ys)

          const path = d3Path()
          path.moveTo(mappedPts[0].x, mappedPts[0].y)
          for (let i = 0; i <= currentStep; i++) {
            path.lineTo(mappedPts[i].x, ys[i])
          }

          if (x <= mappedPts[mappedPts.length - 1].x) {
            path.lineTo(x, y)
          }

          return (
            <g>
              <path d={path.toString()}
                strokeDasharray={(type === 'solid') ? 'none' : '5,5' }
                strokeWidth={width}
                fill="none"
                stroke={stroke}>
              </path>
              {this.renderCircle(currentStep)}
            </g>
          )
        }}
      </Motion>

    return (
      <Motion key={points.length} style={{ ...ys }}>
        {animateAtX}
      </Motion>
    )
  }
}
