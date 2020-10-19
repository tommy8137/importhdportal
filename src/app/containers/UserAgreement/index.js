import actionTypes from './action-types'

export default __CLIENT__ || __UNIVERSAL__ ? require('./UserAgreement') : null

export {
  actionTypes,
}
