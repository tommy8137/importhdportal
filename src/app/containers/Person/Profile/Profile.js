import React, { Component } from 'react'
import CSSModules from 'react-css-modules'
import styles from './profile.css'
import { connect } from 'react-redux'


function RawRow(props) {
  return (
    <div styleName="row">
      <div styleName="label">{props.label}:&nbsp;</div>
      <div styleName="value">{props.value}</div>
    </div>
  )
}

const Row = CSSModules(RawRow, styles)

@connect(
  (state) => ({
    l: (word) => state.locale.get('locale').get(word),
    id: state.auth.get('id'),
    name: state.auth.get('name'),
    displayName: state.auth.get('displayName'),
    position: state.auth.get('position'),
    phone: state.auth.get('phone'),
    email: state.auth.get('email'),
  })
)
@CSSModules(styles)
export default class extends Component {
  renderRow = () => {
    return (
      <div styleName="row">
        <div styleName="label">{l('ID')}:</div>
        <div styleName="value"></div>
      </div>
    )
  };

  render() {
    const { l, id, name, displayName, position, phone, email } = this.props
    return (
      <div styleName="container">
        <div styleName="header">{l('Profile Info')}</div>
        <div styleName="content">
          <Row label={l('ID')} value={id}/>
          <Row label={l('Name')} value={name}/>
          <Row label={l('Display Name')} value={displayName}/>
          <Row label={l('Position')} value={position}/>
          <Row label={l('Phone')} value={phone}/>
          <Row label={l('E-mail')} value={email}/>
        </div>
      </div>
    )
  }
}
