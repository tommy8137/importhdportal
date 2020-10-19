import immutable, { fromJS } from 'immutable'
import TYPES from 'constants/action-types'
import RT from './action-types'
import { createSelector } from 'reselect'

export const initState = fromJS({
  module: null,
  libs: {
    entities: {},
    result: [],
  },
  modules: {}, // all risk modules here
})

export default function(state = initState, action) {
  switch (action.type) {
    case RT.RISK_LIBS_SUCCESS:
      return state.merge({ libs: action.result })
    case RT.RISK_MODULE_SELECT: {
      const { moduleId } = action
      const module = state.getIn(['modules', moduleId])
      if (module) {
        return state.set('module', fromJS({ state: module.get('initState').toJS(), moduleId }))
      } else {
        return state.set('module', null)
      }
    }
    case RT.RISK_LOAD_MODULES: {
      const { modules } = action
      return state.set('modules', fromJS(modules))
    }
    default: {
      const module = state.get('module')
      if (!module) {
        return state
      } else {
        const moduleId = state.getIn(['module', 'moduleId'])
        const moduleState = state.getIn(['module', 'state'])
        const moduleReducer = state.getIn(['modules', moduleId, 'reducer'])
        if (!moduleState || !moduleReducer) {
          return state
        }
        return state.setIn(['module', 'state'], moduleReducer(moduleState, action))
      }
    }
  }
}

function makeModule(initState, reducer) {
  return { initState, reducer }
}
