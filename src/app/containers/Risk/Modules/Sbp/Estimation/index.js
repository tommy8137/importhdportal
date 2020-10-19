import reducer, { initState, categoryId, moduleId } from './reducer'
import { preload } from './saga'

const container = __CLIENT__ || __UNIVERSAL__ ? require('./Estimation') : null
export default container

export {
  container,
  reducer,
  initState,
  categoryId,
  moduleId,
  preload,
}
