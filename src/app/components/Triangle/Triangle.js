import CSSModules from 'react-css-modules'
import styles from './triangle.css'
import React, { Component, PropTypes } from 'react'

const CONSTANT_TRIANGLE = {
  ASC: <polygon points="2,5 12,5 7,0" />,
  DESC: <polygon points="2,0 12,0 7,5" />,
}

@CSSModules(styles)
export default class Triangle extends Component {
  static propTypes = {
    direction: PropTypes.string,
    isFocus: PropTypes.bool,
  }

  state = {
    triangle: CONSTANT_TRIANGLE.ASC,
  }

  componentWillMount() {
    this.updateDirection(this.props.direction)
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.isFocus) {
      this.updateDirection(nextProps.direction)
    }
  }

  updateDirection = (direction) => {
    this.setState({ triangle: CONSTANT_TRIANGLE[direction] })
  }

  render() {
    const tringleBlurStyle =
      (this.props.isFocus) ? 'triangle-focus' : 'triangle-blur'
    return (
      <span styleName={`${tringleBlurStyle}`}>
        <svg styleName="triangle" width="15" height="10"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg">
          {this.state.triangle}
        </svg>
      </span>
    )
  }
}
