import React from 'react'
import { RouterContext } from 'react-router'
import { fetchingTask } from 'sagas/fetch'
import { call, put, take, fork } from 'redux-saga/effects'
import { Provider } from 'react-redux'
import merge from 'lodash.merge'
import { canUseDOM } from './fetch'
import { enableFetchAtBrowser } from 'actions/universal-action'
import TYPES from 'constants/action-types'
import isEqual from 'lodash/isEqual'

const { SAGA_PRELOAD_ACTION } = TYPES

export function findPreloaderTasks(components, args, options) {
  return components
    .filter(c => c && c.preloader)
    .map(c => {
      let tasks = []
      if (typeof c.preloader === 'function') {
        let task = makeFetchingTask(c.preloader(args), options) // c.preloader() should be like: { fetch, status }
        tasks.push(task)
      } else if (Array.isArray(c.preloader)) {
        c.preloader.forEach(pl => {
          let task = makeFetchingTask(pl(args), options)
          tasks.push(task)
        })
      }
      return tasks
    })
    .reduce((result, preloader) => result.concat(preloader), [])
}

function makeFetchingTask({ type, status = [], fetch, task }, options) { // fetch is like: { url, options }
  const [REQUESTING, SUCCESS, FAILURE, CANCELLATION] = status
  // feed the token
  if (Array.isArray(fetch)) {
    fetch = fetch.map(f => merge({}, fetch, { options }))
  } else if (typeof fetch === 'object') {
    fetch = [merge({}, fetch, { options })]
  } else if (type === TYPES.SAGA_CUSTOM_TASK && task) {
    fetch = [{ customTask: task, ...options }]
  } else {
    return console.log('should not go here in makeFetchingTask')
  }
  status = canUseDOM?
    ['client' + REQUESTING, SUCCESS, 'client' + FAILURE, CANCELLATION]
    :
    ['server' + REQUESTING, SUCCESS, 'server' + FAILURE, CANCELLATION]
  return call(fetchingTask, { status }, ...fetch)
}

let previousLoaders = []
let previousArgs = {}
/**
 * overwrite the default render function of Router
 * @param  {[type]} props [description]
 * @return {[type]}       [description]
 */
export const renderRouterContext = (store) => (props) => {
  if (!canUseDOM) {
    return <RouterContext {...props}/>
  }
  // else if (!store.getState().universal.fetchAtBrowser) { //data fetched at server side
  //   // reset the flag of fetchAtBrowser
  //   store.dispatch(enableFetchAtBrowser())
  //   return <RouterContext {...props}/>
  // }
  // failed to fetch data at server side, need to fetch data at browser
  const currentLoaders = props.components
    .filter(c => c && c.preloader)
    .map(c => {
      let loaders = []
      if (typeof c.preloader === 'function') {
        loaders.push(c.preloader)
        // preloaders.push(c.preloader(props.params))
      } else if (Array.isArray(c.preloader)) {
        // c.preloader.forEach(pl => preloaders.push(pl(props.params)))
        c.preloader.forEach(pl => loaders.push(pl))
      }
      return loaders
    })
    .reduce((result, preloaders) => result.concat(preloaders), [])
  const args = { params: props.params, query: props.location.query }
  const needToFetch = currentLoaders
    .filter(l => !isEqual(previousArgs, args) || previousLoaders.indexOf(l) == -1)
    .map(l => l(args))
  if (needToFetch.length > 0) {
    // must ensure component do rendering first, any better way?
    setTimeout(() => needToFetch.forEach(pl => store.dispatch(pl)), 0)
  }
  previousLoaders = currentLoaders
  previousArgs = args

  return <RouterContext {...props}/>
}
