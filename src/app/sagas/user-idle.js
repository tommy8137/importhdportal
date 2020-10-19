import { put, take, fork, select, call, race, cancelled } from 'redux-saga/effects'
import { eventChannel, END, buffers } from 'redux-saga'
import { canUseDOM } from '../utils/fetch'
import TYPES from 'constants/action-types'
import { logout } from 'containers/Login/auth-action'
import LT from 'containers/Login/action-types'

const debounce = 1000 * 5

export default function* monitorUserIdle() {
  const autoLogout = yield select((state) => state.globalConfigs.get('autoLogout'))
  if(!canUseDOM || !autoLogout) {
    return
  }
  while (true) {
    const tokenValid = yield select((state) => state.auth.get('tokenValid'))
    if (!tokenValid) {
      yield take([LT.LOGIN_SUCCESS, TYPES.REFRESH_TOKEN_DONE])
      yield race({
        userLogout: take(TYPES.LOGOUT_SUCCESS),
        monitorUser: call(monitorUser),
      })
    } else {
      yield race({
        userLogout: take(TYPES.LOGOUT_SUCCESS),
        monitorUser: call(monitorUser),
      })
    }
  }
}

const delay = (ms) => new Promise((resolve, reject) => setTimeout(() => resolve(true), ms))

function* monitorUser() {

  const chan = yield call(userMoved)
  let timeout = yield select((state) => state.app.get('timeout'))
  if (!timeout) {
    console.warn('timeout is not set, something wrong! use 10 mins instead')
    timeout = 10 * 60 * 1000
  }
  let lastMovedAt = Date.now()
  let offset = 0
  try {
    while (true) {
      const { userIdle, userMovedAt } = yield race({
        userIdle: delay(timeout - offset),
        userMovedAt: take(chan),
      })
      if (userMovedAt) { //user moved
        lastMovedAt = userMovedAt
      } else { //user is idle => need to log user out
        yield put(logout())
      }

      yield call(delay, debounce)
      offset = debounce + Date.now() - lastMovedAt
    }
  } finally {
    if (yield cancelled()) {
      chan.close()
    }
  }
}

const userMoved = () => eventChannel(listener => {
  const eventListener = (e) => {
    listener(Date.now())
  }

  document.addEventListener('keydown', eventListener)
  document.addEventListener('click', eventListener)
  document.addEventListener('mousemove', eventListener)

  return () => {
    document.removeEventListener('keydown', eventListener)
    document.removeEventListener('click', eventListener)
    document.removeEventListener('mousemove', eventListener)
  }
}, buffers.sliding(0))
