import React, { Component, PropTypes } from 'react'
import CSSModules from 'react-css-modules'
import styles from './error-handler.css'
import surprise from './images/surprise.png'
@CSSModules(styles)
export default class extends Component {
  static propTypes = {
    status: PropTypes.string,
    title: PropTypes.string,
    details: PropTypes.string,
  };
  render() {
    const { status, title, details } = this.props
    return (
      <div styleName="container">
        <div styleName="error-code">
          <img src={surprise} />
          {status}
        </div>
        <div styleName="error-title">
          {title}
        </div>
        <div styleName="error-details">
          {details}
        </div>
      </div>
    )
  }
}

