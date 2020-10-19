import { showAlarmPharseModalSAC } from './actions'
import { reFetchAlarmRelativeData } from './saga'

export default __CLIENT__ || __UNIVERSAL__ ? require('./AlarmPhraseModal') : null

export {
  showAlarmPharseModalSAC,
  reFetchAlarmRelativeData,
}
