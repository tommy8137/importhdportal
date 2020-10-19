import { routerReducer as routing } from 'react-router-redux'
import { combineReducers } from 'redux'
import auth from 'reducers/auth-reducer'
import { reducer as form } from 'redux-form'
import login from 'containers/Login/reducer'
import app from 'reducers/app-reducer'
import { tableReducer as table } from 'app/libs/redux-table'
import locale from 'reducers/locale-reducer'
import patient from './patient'
import overview from 'containers/Patient/Overview/reducer'
import search from 'containers/Patient/Search/reducer'
import about from 'containers/Admin/About/reducer'
import setting from 'containers/Admin/Settings/reducer'
import { reducer as effective } from 'containers/Effective'
import globalConfigs from './global-configs-reducer'

const reducer = combineReducers({
  app,
  routing,
  auth,
  login,
  effective,
  admin: combineReducers({
    about,
    setting,
  }),
  form, // redux-form's reducer
  table,
  locale,
  patient,
  overview: combineReducers({
    overview,
    search,
  }),
  globalConfigs,
})

export default reducer
