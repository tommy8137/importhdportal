import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import styles from './risk.css'
import transitionStyle from './transition.css'

import ReactCSSTransitionGroup from 'react-addons-css-transition-group'
import UserBar from 'components/UserBar'
import selector from './selector'

import FilterBar from './components/FilterBar'
import ModuleSwitcher from './Modules/ModuleSwitcher'
import CSSModules from 'react-css-modules'
import moment from 'moment'
import { preloader } from './actions'
import Helmet from 'react-helmet'

@connect(selector)
@CSSModules(styles)
export default class extends Component {
  static preloader = preloader;

  render() {
    const { location: { pathname, query }, categories, modules, l, c_id, m_id, ModuleContainer } = this.props

    return (
      <div styleName="container">
        <Helmet title="Risk Analysis"/>
        <UserBar/>
        <div styleName="main">
          <section styleName="filter-bar">
          {
            (!m_id) && (
              <FilterBar
                pathname={pathname}
                query={query}
                cId={c_id}
                mId={m_id}
                categories={categories}
                modules={modules}
                l={l}/>
            )
          }
          </section>
          <ModuleSwitcher cId={c_id} mId={m_id} ModuleContainer={ModuleContainer}/>
        </div>
      </div>
    )
  }
}

