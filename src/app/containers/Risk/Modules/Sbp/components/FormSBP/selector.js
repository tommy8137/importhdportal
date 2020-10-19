import { maybe } from 'maybes'
import R from 'ramda'

export const fieldNames = {
  conductivity: 'Conductivity',
  dia_temp_value: 'Dialysate Temp.',
  uf: 'UFR',
  blood_flow: 'Blood Flow',
  total_uf: 'UF',
  dia_flow: 'Dialysate Flow',
  ns: 'N/S',
}

const itemNames = Object.keys(fieldNames).concat(['sbp', 'deltadia_temp_value', 'target_uf', 'delta_bloodflow', 'delta_uf'])

const isFormField = (value, key) => itemNames.indexOf(key) >= 0
const mapToInt = (value, key, obj) => parseInt(value)
const mapToFloat = (value, key, obj) => parseFloat(value)

const parseIntFormFields = R.compose(
  R.mapObjIndexed(mapToInt),
  R.pick(['blood_flow', 'dia_flow', 'sbp'])
)

const parseFloatFormFields = R.compose(
  R.mapObjIndexed(mapToFloat),
  R.pickBy((value, key) => key != 'blood_flow' && key != 'dia_flow' && key != 'sbp'),
  R.pickBy(isFormField)
)

export const parseFormFields = R.converge(
  R.unapply(R.mergeAll), [
    R.clone,
    parseIntFormFields,
    parseFloatFormFields,
  ]
)

const itemsToObject = (items) =>
  itemNames.reduce((reduced, name) => {
    reduced[name] = items.getIn([name, 'data'])
    return reduced
  }, {})

export const mapItems = (items) =>
  maybe(items)
    .map(item => {
      return item.set('dia_temp_value', item.get('pre_dia_temp_value')) // replace all of the dia_temp with pre_dia_temp
    })
    .map(itemsToObject)
    .orJust({})
