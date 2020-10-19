import React, { Component } from 'react'
import TabContainer from 'components/TabContainer'
import LinkTab from 'components/LinkTab'
import { connect } from 'react-redux'
import CSSModules from 'react-css-modules'
import styles from './person.css'
import Helmet from 'react-helmet'
import { localeSelector } from 'reducers/locale-reducer'
import Transitioner from 'components/Transitioner'

@connect(
  state => ({
    l: localeSelector(state),
  })
)
@CSSModules(styles)
export default class extends Component {
  render() {
    const { location: { pathname }, l } = this.props
    return (
      <div styleName="container">
        <Helmet title="Person"/>
        <TabContainer location={this.props.location}>
          <LinkTab to="/profile">{l('My Profile')}</LinkTab>
          <LinkTab to="/profile/copyright">{l('License Agreement')}</LinkTab>
        </TabContainer>
        <Transitioner>
          {this.props.children}
        </Transitioner>
      </div>
    )
  }
}
