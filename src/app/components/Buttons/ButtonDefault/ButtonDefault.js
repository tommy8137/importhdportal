import React, { Component } from 'react'
import styles from './styles.css'
import CSSModules from 'react-css-modules'

@CSSModules(styles)
export default class ButtonDefault extends Component {
  render() {
    const { style, className, children, ...restProps } = this.props
    return (
      <button
        style={style}
        styleName="primary"
        className={className}
        {...restProps}>
        {this.props.children}
      </button>
    )
  }
}
