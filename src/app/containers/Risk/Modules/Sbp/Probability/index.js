import reducer, { initState, categoryId, moduleId } from './reducer'
import { preload } from './saga'

const container = __CLIENT__ || __UNIVERSAL__ ? require('./Probability') : null
export default container

export {
  container,
  reducer,
  initState,
  categoryId,
  moduleId,
  preload,
}
