import React, { Component, PropTypes } from 'react'
import CSSModules from 'react-css-modules'
import ReactFauxDOM from 'react-faux-dom'
import PureRenderMixin from 'react-addons-pure-render-mixin'
import styles from './styles.css'
import { select, selectAll } from 'd3-selection'
import { range as d3Range } from 'd3-array'
import { axisBottom } from 'd3-axis'
import { timeFormat } from 'd3-time-format'

@CSSModules(styles)
export default class XTimeAxis extends Component {
  static propTypes = {
    left: PropTypes.number.isRequired,
    right: PropTypes.number.isRequired,
    xScaleFunc: PropTypes.func.isRequired,
    callback: PropTypes.func,
    height: PropTypes.number,
    heightOffset: PropTypes.number,
    currentTime: PropTypes.number,
    startTime: PropTypes.number.isRequired,
    endTime: PropTypes.number.isRequired,
  }

  constructor(props) {
    super(props)
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this)
  }

  calculateDomainTime(xScale, time, boundary, sign) {
    const min30 = 30 * 60 * 1000
    const boundaryTime = xScale.invert(boundary)
    const condition = (t) => sign > 0 ? (t <= boundaryTime) : (t >= boundaryTime)
    let i = 0
    while (condition(time + i * sign * min30)) {
      i++
    }
    return time + i * sign * min30
  }

  render() {
    const { xScaleFunc, callback, width, height, currentTime, bottom } = this.props
    const { startTime, endTime, left, right } = this.props
    const min30 = 30 * 60 * 1000

    const domainStart = this.calculateDomainTime(xScaleFunc, startTime, left, -1)
    const domainEnd = this.calculateDomainTime(xScaleFunc, endTime, right, 1)
    const times = d3Range(domainStart, domainEnd, min30)
    let xAxis = axisBottom(xScaleFunc)
      .tickFormat(timeFormat("%H:%M"))
      .tickPadding(17)
      .tickValues(times)
      .tickSize(0)

    if (height) { // tick line
      // xAxis.tickSize(-height, 0)
    }

    const vdom = ReactFauxDOM.createElement('g')
    select(vdom)
      .call(xAxis)
      .attr('transform', `translate(${0}, ${bottom})`)
      .selectAll('.tick')
      .on('click', (d, i) => {
        if (typeof callback === 'function') {
          callback(d, i)
        }
      })
    select(vdom).selectAll('.tick').select('text').attr('fill', (t, i) => {
      if (t < startTime || t > endTime) {
        return 'none'
      } else {
        return '#000'
      }
    })
    select(vdom).selectAll('.tick').select('line').attr('y2', -height)
    // select(vdom).selectAll('.tick')
    //   .filter((d) => (d.valueOf() === currentTime))
    //   .attr('className', styles.currentTime)

    return (
      <g>
        <g styleName="xAxis" >
          {vdom.toReact()}
        </g>
        <line styleName="axis-bottom-line" x1={left} x2={right} y1={bottom} y2={bottom} />
      </g>
    )
  }
}
