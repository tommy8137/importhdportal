import { put, take, fork, select, call, race, cancelled } from 'redux-saga/effects'
import TYPES from 'constants/action-types'
import { requireLocale } from 'app/apis/locale'
import { canUseDOM } from '../utils/fetch'
import monitorUserIdle from './user-idle'
import checkRefreshToken from './check-refresh-token'
import { LOCATION_CHANGE } from 'react-router-redux'
import { currentShift, changeShiftTask } from 'app/containers/Patient/Overview/saga'
import moment from 'moment'

export default function* appSaga() {
  yield call(checkRefreshToken)
  yield [
    fork(updateTimeTask),
    fork(switchLangTask),
    fork(monitorUserIdle),
    fork(monitorLocation),
  ]
}

export function* updateTimeTask() {
  yield put({ type: TYPES.APP_UPDATE_TIME, currentTime: Date.now().valueOf() })
  while (true) {
    yield call(delay, 1000 * 60)
    yield put({ type: TYPES.APP_UPDATE_TIME, currentTime: Date.now().valueOf() })
    yield call(changeShiftTask, yield currentShift(moment(Date.now().valueOf()).format('HH:mm')))
  }
}

export function* switchLangTask() {
  while (true) {
    const { lang } = yield take(TYPES.LOCALE_SET_SWITCH)
    const locale = yield call(requireLocale, lang)
    yield put({ type: TYPES.LOCALE_SWITCH, language: lang, locale })
  }
}

function* monitorLocation() {
  while (true) {
    yield take(LOCATION_CHANGE)
    const location = yield select(state => state.routing.locationBeforeTransitions)
    yield put({ type: TYPES.APP_LOCATION_CHANGE, pathname: location.pathname })
  }
}

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))
