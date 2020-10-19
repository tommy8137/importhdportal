import React from 'react'
import { RouterContext } from 'react-router'
import { fetchingTask } from 'sagas/fetch'
import { call, put, take, fork } from 'redux-saga/effects'
import { Provider } from 'react-redux'
import { findPreloaderTasks } from 'app/utils/universal'

export default (renderProps, store, options) => new Promise((resolve, reject) => {
  const args = { params: renderProps.params, query: renderProps.location.query }
  const preloaderTasks = findPreloaderTasks(renderProps.components, args, options)

  store.runSaga(serverStartupSaga(preloaderTasks))
    .done
    .then((isFetch) => resolve(isFetch))
    .catch((ex) => reject(ex))
  store.closeSaga()
})

/**
 * preload at server side
 * @yield {[type]} [description]
 * @return isFetch  are data fetched successfully
 */
const serverStartupSaga = (preloaderTasks) => function* () {
  if (preloaderTasks.length == 0) { // no preload tasks needed
    return true
  }
  try {
    const result = yield preloaderTasks
    const isFetched = result.reduce((r, isNoFetch) => !!isNoFetch || r, false)
    return isFetched
  } catch (ex) {
    ex.status = ex.status || 500
    if (ex.status != 401) {
      throw ex
    }
    // 401 => fetch at browser
    return false
  }
}
