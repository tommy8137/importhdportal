import React, { Component } from 'react'
import styles from 'app/css/components.css'
import CSSModules from 'react-css-modules'

@CSSModules(styles)
export default class extends Component {
  render() {
    return (
      <div styleName="box-with-line">
        {this.props.children}
      </div>
    )
  }
}
