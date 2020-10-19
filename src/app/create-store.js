import { createStore, applyMiddleware, compose } from 'redux'
import createSagaMiddleware from 'redux-saga'
import authMiddleware from './middlewares/auth-middleware'
import reducer from 'reducers/root'
import { canUseDOM, KEY_REFRESH_TOKEN } from './utils/fetch'
import merge from 'lodash.merge'
import { END } from 'redux-saga'
import rootSaga from 'sagas'
import { fromJS } from 'immutable'
import { routerMiddleware } from 'react-router-redux'

const middlewares = [authMiddleware]
// export const sagaMiddleware = createSagaMiddleware()
/**
 * function to create a redux store
 * history   {object}               from some createHistroy()
 * initState {object}               initial state passed to this store
 * @return   {object}               return a redux store
 */
export default function(history, initState) {
  if (canUseDOM && initState) {
    // @todo: pass refresh token
    // initState = merge({}, initState, { auth: { refreshToken: localStorage.getItem(KEY_REFRESH_TOKEN) } })

    // need to serialize
    initState.app && (initState.app = fromJS(initState.app))
    initState.login && (initState.login = fromJS(initState.login))
    initState.auth && (initState.auth = fromJS(initState.auth))
    initState.simulate && (initState.simulate = fromJS(initState.simulate))
    initState.locale && (initState.locale = fromJS(initState.locale))
    initState.patient && (initState.patient = fromJS(initState.patient))
    fromJSNested(initState.overview)
    initState.record && (initState.record = fromJS(initState.record))
    fromJSNested(initState.admin)
    initState.table && (initState.table = fromJS(initState.table))
    initState.effective && (initState.effective = fromJS(initState.effective))
    initState.globalConfigs && (initState.globalConfigs = fromJS(initState.globalConfigs))
  }
  const sagaMiddleware = createSagaMiddleware()
  const finalCreateStore = compose(
    applyMiddleware(...middlewares, routerMiddleware(history), sagaMiddleware),
    __DEV__ && typeof window === 'object' && typeof window.devToolsExtension !== 'undefined' ? window.devToolsExtension() : f => f
  )(createStore)
  const store = finalCreateStore(reducer, initState)
  store.runSaga = sagaMiddleware.run
  store.closeSaga = () => store.dispatch(END)
  // sagaMiddleware.run(updateTimeTask)
  if (canUseDOM && __DEV__ && module.hot) {
    // Enable Webpack hot module replacement for reducers
    module.hot.accept('./reducers/root', () => {
      const nextRootReducer = require('reducers/root').default
      store.replaceReducer(nextRootReducer)
    })
  }
  return store
}


function fromJSPatient(patientState) {
  patientState.profile && (patientState.profile = fromJS(patientState.profile))
  if (patientState.infos) {
    const keys = Object.keys(patientState.infos)
    keys.forEach((key) => {
      patientState.infos[key] = fromJS(patientState.infos[key])
    })
  }
}


function fromJSNested(nestedState) {
  const keys = Object.keys(nestedState)
  keys.forEach((key) => {
    nestedState[key] = fromJS(nestedState[key])
  })
}
