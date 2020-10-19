import React, { Component } from 'react'
import CSSModules from 'react-css-modules'
import styles from './patient.css'
import TabContainer from 'components/TabContainer'
import LinkTab from 'components/LinkTab'
import { connect } from 'react-redux'
import Helmet from 'react-helmet'
import { localeSelector } from 'reducers/locale-reducer'
import Transitioner from 'components/Transitioner'

@connect(
  (state) => ({
    l: localeSelector(state),
  })
)
@CSSModules(styles)
export default class Patient extends Component {
  render() {
    const { l } = this.props

    return (
      <div styleName="container">
        <Helmet title="Overview"/>
        <TabContainer>
          <LinkTab to="/overview">{l('Overview')}</LinkTab>
          <LinkTab to="/overview/search">{l('Search')}</LinkTab>
        </TabContainer>
        {this.props.children}
      </div>
    )
  }
}
