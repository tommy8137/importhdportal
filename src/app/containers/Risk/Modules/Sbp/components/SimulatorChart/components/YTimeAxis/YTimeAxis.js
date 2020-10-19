import React, { Component, PropTypes } from 'react'
import ReactFauxDOM from 'react-faux-dom'
import PureRenderMixin from 'react-addons-pure-render-mixin'
import styles from './styles.css'
import { select } from 'd3-selection'
import { axisLeft } from 'd3-axis'

export default class YTimeAxis extends Component {

  static propTypes = {
    x: PropTypes.number,
    y: PropTypes.number,
    yScale: PropTypes.func,
    sbpAlarmThreshold: PropTypes.number,
  };

  constructor(props) {
    super(props)
    this.shouldComponentUpdate = PureRenderMixin.shouldComponentUpdate.bind(this)
  }

  render() {
    const { x, y, yScale, sbpAlarmThreshold } = this.props

    const yAxis = axisLeft(yScale)
      .tickSize(0, 0)
      .tickPadding(10)
      .tickValues([sbpAlarmThreshold])

    const vdom = ReactFauxDOM.createElement('g')
    const g = select(vdom)
      .attr("transform", `translate(${x}, ${y})`)
      .call(yAxis)

    return <g className={styles.yAxis}>{vdom.toReact()}</g>
  }
}
