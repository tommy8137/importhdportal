import React, { Component } from 'react'
import PureRendering from 'react-addons-pure-render-mixin'
import CSSModules from 'react-css-modules'
import styles from '../chart.css'

@CSSModules(styles)
export default class GridLines extends Component {
  constructor(props) {
    super(props)
    this.shouldComponentUpdate = PureRendering.shouldComponentUpdate.bind(this)
  }

  render() {
    const { linesNumber, axisLabelHeight, height, top, left, right, bottom } = this.props
    const lines = []
    for (let i = 0; i < linesNumber; i++) {
      let t = top + (height - axisLabelHeight) * i / linesNumber
      lines.push(
        <line key={i} styleName="bg-horizontal-line" x1={left} y1={t} x2={right} y2={t}/>
      )
    }

    return (
      <g>
        <line styleName="bg-line" x1={left} y1={top} x2={left} y2={bottom}/>
        {lines}
      </g>
    )
  }
}
