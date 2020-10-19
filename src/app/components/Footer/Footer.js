import React, { Component } from 'react'
import CSSModules from 'react-css-modules'
import styles from './footer.css'
import { localeSelector } from 'reducers/locale-reducer'
import { connect } from 'react-redux'

@connect(
  state => ({ l: localeSelector(state) })
)
@CSSModules(styles)
export default class extends Component {
  render() {
    const { l } = this.props
    const content = l('Copyrigh 2016 Wistron Corporation. All rights reserved.')
      .split('\n')
      .map((text, key) => ({ __html: text }))
      .map((innerHtml, key) => <div key={key} dangerouslySetInnerHTML={innerHtml} />)
    return (
      <div styleName="footer">
        {content}
      </div>
    )
  }
}
