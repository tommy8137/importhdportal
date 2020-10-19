import reducer, { initState } from './reducer'

export default __CLIENT__ || __UNIVERSAL__ ? require('./About') : null

export {
  reducer,
  initState,
}
