import React, { Component } from 'react'
import ReactCSSTransitionGroup  from 'react-addons-css-transition-group'
import Header from 'components/Header'
import styles from './home.css'
import CSSModules from 'react-css-modules'
import Footer from 'components/Footer'
import ensureAgreement from 'app/utils/ensure-agreement'
import { passLocation } from 'app/utils/with-location'

let RootCss = null;
if (backgroundPic === 'ECK'){
  RootCss = require('../Root/ECK.css');
}else {
  RootCss = require('../Root/MMH.css');
}

@passLocation
@ensureAgreement
@CSSModules(styles)
export default class Home extends Component {
  resolveKey() {
    const { pathname } = this.props.location
    if (/overview/i.test(pathname)) {
      return pathname
    } else if (/(.*)\/(.*)/i.test(pathname)) {
      return /(.*)\/(.*)/i.exec(pathname)[1].toLowerCase()
    } else {
      return pathname
    }

  }

  render() {
    return (

      <div styleName="base">
        <Header pathname={this.props.location.pathname}/>
        <ReactCSSTransitionGroup
          transitionAppear={false}
          transitionName={RootCss}
          transitionEnterTimeout={300}
          transitionLeaveTimeout={300}>
          <div key={this.resolveKey()} styleName="transition-container">
            <div styleName="content">
              {this.props.children}
            </div>
            <div styleName="footer">
              <Footer/>
            </div>
          </div>
        </ReactCSSTransitionGroup>
      </div>
    )
  }
}
