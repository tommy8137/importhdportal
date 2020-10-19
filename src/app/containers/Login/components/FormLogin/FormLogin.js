import React, { Component } from 'react'
import CSSModules from 'react-css-modules'
import { reduxForm, getFormValues, getFormSyncErrors, Field } from 'redux-form'
import styles from './form-login.css'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { login } from '../../auth-action'
import { Motion, spring } from 'react-motion'
import TYPES from '../../action-types'
import Box from 'components/BoxWithLine'
import { licenseExpiredMsgSelector } from '../../reducer'
import { localeSelector } from 'reducers/locale-reducer'
import { validate, MIN_LENGTH, MAX_LENGTH } from './validate'
import { createSelector } from 'reselect'

@connect(
  state => ({
    status: state.login.get('status'),
    message: state.login.get('message'),
    licenseExpired: licenseExpiredMsgSelector(state),
    loginValues: getFormValues('login')(state),
    loginErrors: getFormSyncErrors('login')(state),
    l: localeSelector(state),
  }),
  dispatch => ({ actions: bindActionCreators({ login }, dispatch) })
)
@reduxForm({
  form: 'login',
  validate,
})
@CSSModules(styles)
export default class Login extends Component {
  state = {
    submitted: false,
    loginResult: null,
  }

  componentDidMount() {
    this._input && this._input.focus()
  }

  componentWillReceiveProps(newProps) {
    if (newProps.status === TYPES.LOGIN_FAILED || newProps.status === TYPES.LOGIN_SUCCESS) {
      this.setState({
        loginResult: newProps.status,
      })
    }
  }

  handleSubmit = (e) => {
    e.preventDefault()
    this.setState({ submitted: true })
    const { loginValues, valid, actions: { login } } = this.props
    if (valid) {
      login(loginValues.username, loginValues.password)
    }
    return false
  }

  handleReset = (e) => {
    e.preventDefault()
    this.setState({ submitted: false }, this.props.resetForm)
    return false
  }

  isErrorsExist = (fieldName) => {
    const { loginErrors } = this.props
    return (loginErrors && loginErrors[fieldName])
  }

  translateErrorMsg = () => {
    const { loginErrors, message, l, licenseExpired } = this.props
    const replaceRegex = /(.*)(%s)(.*)(%s)(.*)/i
    const replaceMethod = (match, p1, p2, p3, p4, p5) => {
      return (p1 + MIN_LENGTH + p3 + MAX_LENGTH + p5)
    }

    const usernameError = this.isErrorsExist('username')
      && l(loginErrors.username).replace(replaceRegex, replaceMethod)
    const passwordError = this.isErrorsExist('password')
      && l(loginErrors.password).replace(replaceRegex, replaceMethod)
    const errorMessage = message? l(message): (usernameError || passwordError || licenseExpired)
    return errorMessage
  }

  render() {
    const { valid, l, licenseExpired } = this.props
    const { submitted, loginResult } = this.state
    const showError = (submitted && (loginResult === TYPES.LOGIN_FAILED || !valid)) || licenseExpired

    let errorMessage = null
    if(showError) {
      errorMessage = this.translateErrorMsg()
    }
    
    return (
      <form styleName="form-login" onSubmit={this.handleSubmit} autoComplete="off">
        <Field
          name="username"
          component={renderInput}
          placeholder={l('Account')}
          type="text" />
        <Field
          name="password"
          component={renderInput}
          placeholder={l('Password')}
          type="password" />
        <Motion
          defaultStyle={{ maxHeight: 0, padding: 0 }}
          style={{
            maxHeight: showError? spring(5): spring(0, { precision: 1 }),
            padding: showError? 0.5: 0,
          }}>
          {(interpolator) => (
            <div
              className={styles['error-message']}
              style={{ maxHeight: `${interpolator.maxHeight}rem`, visibility: showError? '': 'hidden' }}>
              <span>{errorMessage}</span>
            </div>
          )}
        </Motion>
        <div styleName="row-buttons">
          <Box>
            <button styleName="button" type="submit">{l('Login')}</button>
          </Box>
          <button styleName="button" type="button" onClick={this.handleReset}>{l('Clear')}</button>
        </div>
      </form>
    )
  }
}

const renderInput = CSSModules(styles)(
  field => {
    return (
      <div>
        <input type={field.type}
          styleName="input"
          placeholder={field.placeholder}
          {...field.input} />
      </div>
    )
  }
)
