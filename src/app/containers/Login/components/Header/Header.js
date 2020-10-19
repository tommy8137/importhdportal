import React, { Component } from 'react'
import styles from './header.css'
import CSSModules from 'react-css-modules'
import { connect } from 'react-redux'
import moment from 'moment'
import logo from './BestShape_b.png'

@connect(
  (state, ownProps) => ({
    currentTime: state.app.get('currentTime')
    ? moment(state.app.get('currentTime')).format('YYYY-MM-DD HH:mm a')
    : null,
  }),
)
@CSSModules(styles)
export default class extends Component {
  render() {
    return (
      <div styleName="header-container">
        <div styleName="header">
          <img styleName="logo" src={logo}/>
          <div styleName="current-time">
            {this.props.currentTime}
          </div>
        </div>
      </div>
    )
  }
}
