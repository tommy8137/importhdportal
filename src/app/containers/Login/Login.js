import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import CSSModules from 'react-css-modules'
import styles from './login.css'
import FormLogin from './components/FormLogin'
import Header from './components/Header'
import Helmet from 'react-helmet'
import Footer from 'components/Footer'

@connect(
  (state) => ({ title: state.locale.get('locale').get('User Login')})
)
@CSSModules(styles)
export default class Login extends Component {

  constructor(props) {
    super(props)
  }

  render() {

    return !this.props.children
    ? (
      <div styleName="container">
        <Helmet title="Login"/>
        <Header/>
        <div styleName="inner">
          <div styleName="title">{this.props.title}</div>
          <FormLogin/>
        </div>
        <div styleName="foot-container">
          <Footer/>
        </div>
      </div>
    )
    : (
      <div styleName="container">
        <Header/>
        {this.props.children}
        <div styleName="foot-container">
          <Footer/>
        </div>
      </div>
    )
  }
}
