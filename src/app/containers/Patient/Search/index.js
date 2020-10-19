import reducer, { initState } from './reducer'

export default __CLIENT__ || __UNIVERSAL__ ? require('./Search') : null

export {
  reducer,
  initState,
}
