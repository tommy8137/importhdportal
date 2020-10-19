import React, { Component } from 'react'
import { connect } from 'react-redux'
import UserAgreement from 'containers/UserAgreement'
import LicenseExpired from 'containers/LicenseExpired'
import Unauthorized from 'containers/Unauthorized'
import R from 'ramda'

// (aggrements, tokenValid, licenseExpired, wrappedComponent)
const ConditionRender = R.cond([
  [({ licenseExpired }) => licenseExpired, R.always(<LicenseExpired/>)],
  [({ tokenValid }) => !tokenValid, R.always(<Unauthorized/>)],
  [({ agreements }) => !agreements, R.always(<UserAgreement/>)],
  [R.T, ({ children }) => children]
])

const ensureAgreement = (WrappedComponent) => {
  @connect(
    (state) => ({
      l: word => state.locale.get('locale').get(word),
      agreements: state.auth.get('agreements') == 1,
      tokenValid: state.auth.get('tokenValid'),
      licenseExpired: state.app.get('licenseExpired'),
    })
  )
  class EnsureAgreementComponent extends Component  {
    render() {
      const { agreements, tokenValid, licenseExpired, ...rest } = this.props
      const conditions = { agreements, tokenValid, licenseExpired }
      return (
        <ConditionRender {...conditions}>
          <WrappedComponent {...rest}/>
        </ConditionRender>
      )
    }
  }

  return EnsureAgreementComponent
}
export default ensureAgreement
