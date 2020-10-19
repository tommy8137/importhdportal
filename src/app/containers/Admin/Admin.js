import React, { Component } from 'react'
import TabContainer from 'components/TabContainer'
import LinkTab from 'components/LinkTab'
import styles from './admin.css'
import CSSModules from 'react-css-modules'
import { connect } from 'react-redux'
import Helmet from 'react-helmet'
import { localeSelector } from 'reducers/locale-reducer'
import Transitioner from 'components/Transitioner'

@connect(
  (state) => ({ l: localeSelector(state) })
)
@CSSModules(styles)
export default class extends Component {
  render() {
    const { l } = this.props
    return (
      <div styleName="container">
        <Helmet title="Admin"/>
        <TabContainer location={this.props.location}>
          <LinkTab to="/admin/settings">{l('Settings')}</LinkTab>
          <LinkTab to="/admin/about">{l('About')}</LinkTab>
        </TabContainer>
        <Transitioner>
          {this.props.children}
        </Transitioner>
      </div>
    )
  }
}
