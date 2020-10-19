import React, { Component, PropTypes } from 'react'
import CSSModules from 'react-css-modules'
import styles from './circle.css'
@CSSModules(styles)
export default class Circle extends Component {
  static propTypes = {
    x: PropTypes.number,
    y: PropTypes.number,
    fill: PropTypes.string,
    stroke: PropTypes.string,
    selected: PropTypes.bool,
    customClassName: PropTypes.string,
    strokeWidth: PropTypes.number,
  }

  render() {
    const { x, y, fill, customClassName, ...styleAttrs } = this.props
    return (
      <circle
        {...styleAttrs}
        styleName="node-circle"
        className={customClassName}
        cx={x}
        cy={y}
        fill={'white'} />
    )
  }
}
