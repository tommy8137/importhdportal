import React, { Component } from 'react'
import Container from 'containers/Login'
import styles from './user-agreement.css'
import CSSModules from 'react-css-modules'
import Checkbox from 'components/Checkbox'
import Copyright from 'containers/Person/Copyright'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { actions as authActions } from 'containers/Login'
import { userAgree } from './actions'

const { logout } = authActions

@connect(
  (state) => ({
    lang: state.locale.get('locale').get('name'),
    l: (word) => state.locale.get('locale').get(word),
  }),
  (dispatch) => ({
    actions: bindActionCreators({ logout, userAgree }, dispatch),
  })
)
@CSSModules(styles)
export default class UserAgreement extends Component {
  state = {
    alwaysShow: true,
    agreement: false,
    agreementDisabled: true,
  };

  handleAlwaysShowClick = (e) => {
    this.setState({
      alwaysShow: !this.state.alwaysShow,
    })
  };

  handleAgreementClick = (e) => {
    this.setState({
      agreement: !this.state.agreement,
    })
  };

  enableChkboxAgreement = (e) => {
    this.setState({
      agreementDisabled: false,
    })
  };

  handleSubmit = (e) => {
    e.preventDefault()
    const { actions: { userAgree } } = this.props
    userAgree(this.state.alwaysShow)
  };

  logout = (e) => {
    e.preventDefault()
    const { actions: { logout } } = this.props
    logout()
  };

  render() {
    const { l } = this.props
    const { alwaysShow, agreementDisabled, agreement } = this.state

    return (
      <Container>
        <div styleName="container">
          <div styleName="main">
            <Copyright scrollToBottomCB={this.enableChkboxAgreement}>
              <form styleName="form" onSubmit={this.handleSubmit}>
                <div styleName="agreement-description">
                  <Checkbox id="chkbox-alwaysshow" label={l('Always Show')} checked={alwaysShow} onChange={this.handleAlwaysShowClick}/>
                </div>
                <div styleName="agreement-description">
                  <Checkbox
                    id="chkbox-haveagreeed"
                    label={l('I agree to follow this End-User License Agreement.')}
                    disabled={agreementDisabled}
                    checked={agreement}
                    onChange={this.handleAgreementClick}/>
                </div>
                <div styleName="buttons">
                  <button styleName="button" disabled={!agreement} type="submit">{l('Confirm')}</button>
                  <button styleName="button" type="button" onClick={this.logout}>{l('Cancel')}</button>
                </div>
              </form>
            </Copyright>
          </div>
        </div>
      </Container>
    );
  }
}
