import reducer, { initState } from './reducer'

export default __CLIENT__ || __UNIVERSAL__ ? require('./Examination') : null

export {
  reducer,
  initState,
}
