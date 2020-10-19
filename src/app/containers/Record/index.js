import reducer, { initState } from './reducer'
import { fetchDetail } from './saga'
import { chartRangeSelector } from './selector'

export default (__CLIENT__ || __UNIVERSAL__) ? require('./Record') : null

export {
  reducer,
  initState,
  fetchDetail,
  chartRangeSelector,
}
