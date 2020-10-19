import TYPES from 'constants/action-types'
import { fromJS } from 'immutable'
import R from 'ramda'

const getLicenseExpired = R.propOr(true, 'licenseExpired')

export const initState = (options) => fromJS({
  currentTime: null,
  isBusy: false,
  busyList: [],
  timeout: options && options.timeout? options.timeout: 60 * 60 * 1000,
  notification: null,
  modal: {
    modalType: 'warning',
    visible: false,
    title: 'modal-title',
    content: 'modal-content',
  },
  licenseExpired: getLicenseExpired(options),
})

export default function appReducer(state = initState(), action) {
  switch (action.type) {
    case TYPES.APP_LOADING:
      if (!action.eventSource) {
        return state
      }

      let tmpState = state
      if (action.isBusy) {
        // if true, insert new source to list
        tmpState = state.update('busyList', list => list.push(action.eventSource))
      } else {
        // if false, remove source from list
        tmpState = state.set('busyList', state.get('busyList').filter(item => item !== action.eventSource))
      }

      if (tmpState.get('busyList').size > 0) {
        return tmpState.set('isBusy', true)
      } else {
        return tmpState.set('isBusy', false)
      }
    case TYPES.APP_UPDATE_TIME:
      return state.set('currentTime', action.currentTime)
    case TYPES.APP_SET_TIMEOUT:
      return state.set('timeout', action.timeout)
    case TYPES.APP_NOTIFICATION_GREEN:
    // @todo notification system
      return state
    case TYPES.APP_SET_MODAL:
      const { visible, title, content, modalType } = action
      state = state.setIn(['modal', 'visible'], typeof(visible) === 'boolean' ? visible : false)
      modalType && (state = state.setIn(['modal', 'modalType'], modalType))
      title && (state = state.setIn(['modal', 'title'], title))
      content && (state = state.setIn(['modal', 'content'], content))
      return state
    case TYPES.LOGIN_SUCCESS:
      return state.set('licenseExpired', false)
    case TYPES.APP_SET_LICENSE_STATUS:
      return state.set('licenseExpired', action.isExpired)
  }

  return state
}
