import React, { PureComponent } from 'react'
import { timeMinute } from 'd3-time'
import { timeFormat } from 'd3-time-format'
import { axisBottom } from 'd3-axis'
import PureRenderMixin from 'react-addons-pure-render-mixin'
import ReactFauxDOM from 'react-faux-dom'
import { select } from 'd3-selection'

export default class XAxis extends PureComponent {
  render() {
    const { bottom, axisLabelHeight, xScale, callback, selectedTime } = this.props
    const xAxisFunc = axisBottom(xScale)
      .tickSize(0)
      .ticks(timeMinute.every(30))
      .tickFormat(timeFormat('%H:%M'))
      .tickPadding(-axisLabelHeight)

    const xAxis = ReactFauxDOM.createElement('g')
    select(xAxis).call(xAxisFunc)
      .attr('fill', '#666')
      .attr('stroke', 'none')
      // https://github.com/d3/d3/blob/master/CHANGES.md#axes-d3-axis
      // there will be a half-pixel offset wtf?
      .attr('transform', `translate(${-0.5}, ${bottom})`)
      .attr('text-anchor', 'middle')
      .selectAll('.tick')
      .on('click', (d, i) => {
        if (typeof callback === 'function') {
          callback(d.valueOf(), i)
        }
      })

    select(xAxis).selectAll('.tick')
      .filter(d => d.valueOf() == selectedTime)
      .select('text')
      .attr('fill', '#ff873f')

    return xAxis.toReact()
  }
}
