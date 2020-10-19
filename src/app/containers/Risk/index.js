import reducer, { initState, maxBlood } from './reducer'
import { categoryModuleSelector, safeGetModuleState, libsSelector } from './selector'
import { fetchRiskLibs } from './saga'

export default __CLIENT__ || __UNIVERSAL__ ? require('./Risk') : null

export * from './tasks'

export {
  reducer,
  initState,
  maxBlood,
  categoryModuleSelector,
  libsSelector,
  safeGetModuleState,
  fetchRiskLibs,
}
