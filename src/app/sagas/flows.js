import { fork } from 'redux-saga/effects'
import adminSaga from 'containers/Admin/Settings/saga'
/*
  some kind of flow could be done by saga.
 */
export default function* () {
  yield [
    fork(adminSaga),
  ]
}
