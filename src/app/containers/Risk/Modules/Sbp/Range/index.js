import reducer, { initState, categoryId, moduleId } from './reducer'
import { selectedPointSelector, infoSelector, greenLineSelector, lastPointSelector, preDiaTempSelector, displayThreshold } from './selector'
import { preload, fetchGreenLine, pollingTask, checkIfNeedPoll } from './saga'
import actionTypes from './action-types'

const container = __CLIENT__ || __UNIVERSAL__ ? require('./Range') : null
export default container

export * from './actions'

export {
  container,
  reducer,
  initState,
  categoryId,
  moduleId,
  selectedPointSelector,
  infoSelector,
  greenLineSelector,
  lastPointSelector,
  preload,
  fetchGreenLine,
  pollingTask,
  actionTypes,
  checkIfNeedPoll,
  preDiaTempSelector,
}
