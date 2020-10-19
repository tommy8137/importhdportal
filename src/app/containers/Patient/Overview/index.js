import reducer, { initState } from './reducer'
import { fetchOverviewAbnormalList } from './saga'
export default __CLIENT__ || __UNIVERSAL__ ? require('./Overview'): null

export {
  initState,
  reducer,
  fetchOverviewAbnormalList,
}
