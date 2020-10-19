import React, { Component } from 'react'
import styles from '../style.css'
import CSSModules from 'react-css-modules'
import { connect } from 'react-redux'
import { about } from './actions'

@connect(
  (state) => ({
    l: (word) => state.locale.get('locale').get(word),
    version: state.admin.about.get('version'),
    license: state.admin.about.get('license_key') || '',
    validDate: state.admin.about.get('valid_date'),
  })
)
@CSSModules(styles)
export default class extends Component {
  static preloader = about;

  render() {
    const { l, version, license, validDate } = this.props
    return (
      <div styleName="container">
        <div styleName="block-about">
          <div styleName="header">
            {l('About')}
          </div>
          <div styleName="about-body">
            <div styleName="row">
              <label styleName="label">{l('Version')}</label>
              <div styleName="value">{version}</div>
            </div>
            <div styleName="row">
              <label styleName="label">{l('License Key')}</label>
              <div styleName="value">
                <textarea styleName="license" value={license} readOnly={true}></textarea>
              </div>
            </div>
            <div styleName="row">
              <label styleName="label">{l('Valid Date')}</label>
              <div styleName="value">{validDate}</div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}
