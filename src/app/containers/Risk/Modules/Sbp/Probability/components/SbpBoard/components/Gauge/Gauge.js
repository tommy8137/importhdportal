import React, { Component, PropTypes } from 'react'
import CSSModules from 'react-css-modules'
import styles from './gauge.css'
import { arc } from 'd3-shape'
import { interpolate } from 'd3-interpolate'
import moment from 'moment'
import { Motion, spring } from 'react-motion'
import { linearInterpolateValue } from 'components/Svg/hack-spring100-to-linear'
import PureRenderMixin from 'react-addons-pure-render-mixin'

const outlineD = arc()({
  innerRadius: 80,
  outerRadius: 100,
  startAngle: 0,
  endAngle: Math.PI * 2,
})
const bgD = arc()({
  innerRadius: 85,
  outerRadius: 95,
  startAngle: 0,
  endAngle: Math.PI * 2,
})

function interpolateValue(intValue, targetValue, previousValue) {
  let propotion
  if (typeof(targetValue) == 'number') {
    propotion = previousValue + linearInterpolateValue(
      targetValue - previousValue,
      (intValue - previousValue) / (targetValue - previousValue) * 100)
    propotion = parseInt(propotion)
    if (propotion < 0) {
      propotion = '--'
    }
  } else {
    propotion = '--'
  }

  return propotion
}

@CSSModules(styles)
export default class Gauge extends Component {
  static propTypes = {
    time: PropTypes.number,
    predictProb: PropTypes.number,
    simulateProb: PropTypes.number,
  }
  static defaultProps = {
    time: 1470022087631,
    predictProb: null,
    simulateProb: null,
  }

  state = {
    // save the previous values for the animation.
    previous: {
      times: 0,
      predictProb: -1,
      simulateProb: -1,
    }
  }

  constructor(props) {
    super(props)
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this)
  }

  componentWillReceiveProps(nextProps) {
    const previous = { ...this.state.previous }
    if (nextProps.time != this.props.time) {
      const times = parseInt(moment(this.props.time).get('hour') * 60 + moment(this.props.time).get('minute'))
      previous.times = times
    }
    if (nextProps.propotion != this.props.propotion) {
      previous.propotion = this.props.propotion || 0
    }
    if (nextProps.predictProb != this.props.predictProb) {
      previous.predictProb = this.props.predictProb || 0
    }
    if (nextProps.simulateProb != this.props.simulateProb) {
      previous.simulateProb = this.props.simulateProb || 0
    }
    this.setState({ previous })
  }

  interpolate = (intStyle) => {
    let displayTime
    if (this.props.time) {
      let times = parseInt(moment(this.props.time).get('hour') * 60 + moment(this.props.time).get('minute'))
      times = this.state.previous.times + linearInterpolateValue(
        times - this.state.previous.times,
        (intStyle.times - this.state.previous.times) / (times - this.state.previous.times) * 100)
      times = parseInt(times)
      let minutes = (times % 60)
      minutes = minutes < 10? `0${minutes}`: minutes
      let hours = parseInt(times / 60)
      hours = hours < 10? `0${hours}`: hours.toString()
      displayTime = `${hours}:${minutes}`
    } else {
      displayTime = '─:─'
    }

    let predictProb = interpolateValue(intStyle.predictProb, this.props.predictProb, this.state.previous.predictProb)
    let simulateProb = interpolateValue(intStyle.simulateProb, this.props.simulateProb, this.state.previous.simulateProb)

    const propotion = typeof(this.props.simulateProb) == 'number'
      ? (simulateProb >= 0 ? simulateProb / 100: 0)
      : typeof(this.props.predictProb) == 'number'
      ? (predictProb >= 0 ? predictProb / 100: 0)
      : 0

    const valueD = arc()
      .innerRadius(85)
      .outerRadius(95)
      .startAngle(Math.PI + Math.PI / 100)
      .endAngle(Math.PI  + Math.PI / 100 + (Math.PI * 2  - Math.PI / 50) * propotion)
      .cornerRadius(3)
      ()
    const fill = interpolate('yellow', 'red')(propotion)
    return (
      <svg className={styles.container} viewBox="-100 -100 200 200" preserveAspectRatio="xMidYMid meet">
        <path d={outlineD} className={styles.outline} strokeWidth="2" fill="transparent"/>
        <path d={bgD} className={styles['bg-path']}/>
        <path d={valueD} fill={fill}/>
        <text className={styles['predict-prob']} textAnchor="middle" x="0" y="-55">
          <tspan className={styles['probability']} x="-35" dy="1.0em">{predictProb}</tspan>
          <tspan x="-35" dy="1.2em">%</tspan>
        </text>
        <text className={styles['simulate-prob']} textAnchor="middle" x="0" y="-55">
          <tspan className={styles['probability']} x="35" dy="1.0em">{simulateProb}</tspan>
          <tspan x="35" dy="1.2em">%</tspan>
        </text>
        <rect className={styles.splitter} width="2" height="80" y="-50"/>
        <text className={styles.time} textAnchor="middle" y="60">{displayTime}</text>
      </svg>
    )
  }

  render() {
    const { predictProb, simulateProb } = this.props
    const times = parseInt(moment(this.props.time).get('hour') * 60 + moment(this.props.time).get('minute'))
    const motions = {
      times: spring(times),
      predictProb: predictProb || predictProb == 0 ? spring(predictProb): 0,
      simulateProb: simulateProb || simulateProb == 0 ? spring(simulateProb): 0,
    }
    return (
      <Motion
        defaultStyle={{ times: 0, predictProb: 0, simulateProb: 0 }}
        style={motions}>
        {this.interpolate}
      </Motion>
    )
  }
}
