import React, { Component, PropTypes } from 'react'
import ReactFauxDOM from 'react-faux-dom'
import { axisBottom } from 'd3-axis'
import { select } from 'd3-selection'
import PureRenderMixin from 'react-addons-pure-render-mixin'
import styles from './x-axis.css'
import moment from 'moment'
export default class XAxis extends Component {
  static defaultProps = {
    currentTime: 0,
  }

  static propTypes = {
    x: PropTypes.number,
    y: PropTypes.number,
    xScaleFunc: PropTypes.func,
    callback: PropTypes.func,
    height: PropTypes.number,
    heightOffset: PropTypes.number,
    currentTime: PropTypes.number,
    times: PropTypes.array,
  }

  constructor(props) {
    super(props)
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this)
  }

  render() {
    const { xScaleFunc, callback, height, currentTime, times } = this.props
    const { xPositions, rectH, rectW, rectFill } = this.props
    if (!times || !Array.isArray(times) || times.length < 1) {
      return <g />
    }

    const xAxis = axisBottom()
      .scale(xScaleFunc)
      .ticks(xPositions.length)
      .tickValues(times.map((v, i) => (i)))
      .tickFormat((d) => (times[d] ? moment(times[d], 'x').format('YYMMDD') : null))

    if (height) { // tick line
      xAxis.tickSize(0, 0)
    }

    const vdom = ReactFauxDOM.createElement('g')
    const g = select(vdom)
      .attr('className', 'xAxis')
      .call(xAxis)
      .selectAll('.tick')
      .on('click', (d, i) => {
        if (typeof callback === 'function') {
          callback(times[d], i)
        }
      })
      .selectAll('text')
        .attr('x', -20) // manual setting for x-axis label y position
        .attr('y', -3) // manual setting for x-axis label x position
        .attr('transform', 'rotate(90)')

    select(vdom).selectAll('.tick')
      .attr('transform', (d) => (`translate(${xPositions[d]}, ${height})`))
      .filter((d) => (times[d] === currentTime))
      .insert('rect', 'text')
      .attr('x', -(rectH) / 2)
      .attr('y', -(rectW) / 2)
      .attr('width', rectH)
      .attr('height', rectW / 2)
      .attr('rx', 4)
      .attr('ry', 4)
      .style('fill', rectFill)

    return <g className={styles.xAxis} >{vdom.toReact()}</g>
  }
}
