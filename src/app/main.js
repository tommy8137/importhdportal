import React from 'react'
import ReactDOM from 'react-dom'
import routes from './routes'
import createStore from './create-store'
import { Provider } from 'react-redux'
import { Router, browserHistory } from 'react-router'
import injectTapEventPlugin from 'react-tap-event-plugin'
import { syncHistoryWithStore, routerReducer } from 'react-router-redux'
import { renderRouterContext } from './utils/universal'
import 'react-select/dist/react-select.css'
import { match, RouterContext } from 'react-router'
import rootSaga from 'sagas'
//Needed for onTouchTap
//Can go away when react 1.0 release
//Check this repo:
//https://github.com/zilverline/react-tap-event-plugin
injectTapEventPlugin()

// const createHistory = __UNIVERSAL__ === false ? require('history/lib/createHashHistory') : require('history/lib/createBrowserHistory')

const store = createStore(browserHistory, window.__reduxState__) // __reduxState__ will be valid if universal rendering
const history = syncHistoryWithStore(browserHistory, store, { adjustUrlOnReplay: false })
store.runSaga(rootSaga)
// use dynamic routes to load the necessary resources only.
const matchFunc = () => match({ history, routes }, (error, redirectLocation, renderProps) => {
  if (error) {
    alert('something wrong....')
  } else if (redirectLocation) {
    history.push(redirectLocation.pathname + redirectLocation.search)
    matchFunc()
  } else if (renderProps) {
    const component = (
      <Provider store={store}>
        <Router {...renderProps} history={history} render={renderRouterContext(store)}>
        </Router>
      </Provider>
    )
    ReactDOM.render(
      component,
      document.getElementById('react-container')
    )
  }
})

matchFunc()
