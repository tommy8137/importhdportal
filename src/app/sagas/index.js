import appSaga from './app'
import fetchSaga  from './fetch'
import flows from './flows'
import { fork } from 'redux-saga/effects'

export default function* root() {
  yield [
    fork(appSaga),
    fork(fetchSaga),
    fork(flows),
  ]
}
