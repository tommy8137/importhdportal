import alarmSelector from './selector'
const container = __CLIENT__ || __UNIVERSAL__ ? require('./AlarmHandler') : null
export default container

export {
  alarmSelector,
}
