import React, { Component } from 'react'
import withLocation from 'app/utils/with-location'
import ReactCSSTransitionGroup  from 'react-addons-css-transition-group'
import styles from './transitioner.css'
import CSSModules from 'react-css-modules'

@withLocation
@CSSModules(styles)
export default class Transitioner extends Component {
  render() {
    const component = this.props.children
    return (
      <ReactCSSTransitionGroup
        component="div"
        styleName="container"
        transitionAppear={false}
        transitionName={styles}
        transitionEnterTimeout={500}
        transitionLeaveTimeout={300}>
        <div key={this.props.location.pathname} styleName="animator">
          {component && component}
        </div>
      </ReactCSSTransitionGroup>
    )
  }
}
