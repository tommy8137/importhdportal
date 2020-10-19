import { fieldNames, mapItems } from './selector'

export default __CLIENT__ || __UNIVERSAL__ ? require('./FormSBP') : null

export {
  fieldNames,
  mapItems,
}
