import { call, take, put, select, fork, cancelled, cancel } from 'redux-saga/effects'
import { delay } from 'redux-saga'
import TYPES, { BUSY_SOURCES } from 'constants/action-types'
import { LOCATION_CHANGE } from 'react-router-redux'

const locationChanged = (location, search) => (action) => {
  if (action.type != LOCATION_CHANGE) {
    return false
  }
  return location != action.payload.pathname || search != action.payload.search
}

export function* startToPoll(checkIfNeedToPollTask, todoTask, ...args) {
  try {
    if (!__CLIENT__) {
      return
    }
    const tokenValid = yield select(state => state.auth.get('tokenValid'))
    if (!tokenValid) {
      return
    }
    // do not do the first checking here to prevent from duplicate fetching at first
    // const needToPoll = yield call(checkIfNeedToPollTask)
    // if (!needToPoll) {
    //   return
    // }
    console.log('start to do polling.')
    /*
      the same location still trigger LOCATION_CHANGE possibly
      so we need to avoid this.
     */
    const { thisLocation, search } = yield select(state => ({
      thisLocation: state.routing.locationBeforeTransitions.pathname,
      search: state.routing.locationBeforeTransitions.search,
    }))
    const polling = yield fork(pollingTask, checkIfNeedToPollTask, todoTask, ...args)
    yield take([TYPES.PAGE_CANCEL_POLLING, locationChanged(thisLocation, search)])
    yield cancel(polling)
  } finally {
    console.log('refreshing data cancellation.')
  }
}

function* pollingTask(checkIfNeedToPollTask, todoTask, ...args) {
  try {
    while (true) {
      yield call(delay, 1000 * 60 * 1.5)
      const needToPoll = yield call(checkIfNeedToPollTask)
      if (!needToPoll) {
        return
      }

      yield put({ type: TYPES.APP_LOADING, isBusy: true, eventSource: BUSY_SOURCES.SAGA_POLLING_TASK })
      yield call(todoTask, ...args)
      yield put({ type: TYPES.APP_LOADING, isBusy: false, eventSource: BUSY_SOURCES.SAGA_POLLING_TASK })
    }
  } catch (ex) {
    console.error('error occurs when polling: ', ex)
  }
}


