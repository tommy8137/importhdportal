import React from 'react'
import CSSModules from 'react-css-modules'
import styles from './logout-success.css'
import logoutPng from './images/logged_out.png'

function LogoutSuccess() {
  return (
    <div styleName="background">
      <div styleName="container">
        <img src={logoutPng} />
        <div styleName="heading">{'You have successfully logged out of BestShape.'}</div>
        <div styleName="subheading">{'Please close this browser window.'}</div>
      </div>
    </div>
  )
}

export default CSSModules(LogoutSuccess, styles)
