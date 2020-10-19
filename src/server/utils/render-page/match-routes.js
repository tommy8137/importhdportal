import React from 'react'
import { initState as appInitState } from 'reducers/app-reducer'
import { setAccessToken } from 'actions/universal-action'
import routes from 'app/routes'
import { fromJS } from 'immutable'
import i18n from 'server/utils/i18n'
import { match, RouterContext, createMemoryHistory } from 'react-router'
import { syncHistoryWithStore } from 'react-router-redux'
import createStore, { sagaMiddleware } from 'app/create-store'
import { Provider } from 'react-redux'
import serverSaga from 'server/utils/server-saga'
import renderToHtml from 'server/utils/render-html'
import fs from 'fs'
import path from 'path'

export const initRedux = (requestState) => {
  const { url, timeout, licenseExpired, user, token, agreements, language, refreshToken } = requestState
  const initState = {
    app: appInitState({ timeout, licenseExpired }),
    auth: fromJS({
      ...user,
      token,
      agreements,
      refreshToken,
    }),
    locale: i18n(language),
    globalConfigs: {
      maxblood_upper: global.maxblood_upper,
      maxblood_lower: global.maxblood_lower,
      maxblood_upper_tuning: global.config.maxblood_upper_tuning,
      maxblood_middle_tuning: global.config.maxblood_middle_tuning,
      maxblood_lower_tuning: global.config.maxblood_lower_tuning,
      autoLogout: global.config.autoLogout,
      notesformat: global.config.notesformat,
    },
  }
  const memoryHistory = createMemoryHistory(url)
  const store = createStore(memoryHistory, initState)
  const history = syncHistoryWithStore(memoryHistory, store)
  return { history, store }
}

const matchRoutes = (requestState) => (done) => {
  try {
    const { url, timeout, user, token, agreements, language, assets } = requestState
    const { history, store } = initRedux(requestState)

    match({ history, routes, location: url }, function (error, redirectLocation, renderProps) {
      if (error) {
        error = { message: 'Internal SERVER error', status: 500 , code: 1788 , ...error }
        done(error, null)
      } else if (redirectLocation) {
        done(null, { redirectTo: redirectLocation.pathname + redirectLocation.search })
      } else if (renderProps) {
        const { auth: authState } = store.getState()
        serverSaga(renderProps, store)
          .then(isFetch => {
            store.dispatch(setAccessToken(null))
            if (store.getState().app.get('licenseExpired')) {
              done(null, { redirectTo: '/login?status=403' })
            } else {
              const component =
                <Provider store={store}>
                  <RouterContext {...renderProps}/>
                </Provider>

              done(null, { body: renderToHtml(assets, component, store) })
            }
          })
          .catch(ex => {
            if (!ex.status) {
              console.error(ex)
              done(ex)
              return
            }
            ex.message = ex.message || 'internal server error'
            store.dispatch(setAccessToken(null))
            const component =
              <Provider store={store}>
                <RouterContext {...renderProps}/>
              </Provider>
            // done(ex, null)
            done(null, { body: renderToHtml(assets, component, store) })
            return
          })
        store.closeSaga()
      } else {
        done({ status: 404, message: 'Not found' }, null)
      }
    })
  } catch (ex) {
    done(ex, null)
  }
}

export default matchRoutes
