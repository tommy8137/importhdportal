// import saga from './saga'
import reducer, { initState } from './reducer'

export default __CLIENT__ || __UNIVERSAL__ ? require('./Effective') : null

export {
  // initState,
  reducer,
  // saga,
}
