import optionValue from './option-value'
import R from 'ramda'

export default (simulatorValues) => {
  const values = (simulatorValues && simulatorValues.FormSetting)
    ? simulatorValues.FormSetting : {}
  const errors = {}
  const condition = (values.condition && values.condition.value)
    ? values.condition.value : {}
  const sbpValue = values.sbpValue
  const FLOAT_REGEXP = new RegExp(/^\-?([1-9]+\d+\.?\d*)$|^\-?(\d{1}\.{1}\d*)$|^\-?\d{1}$/)

  if ((condition === optionValue[0] || condition === optionValue[1]) &&
      (R.isNil(sbpValue) ||
        (parseInt(sbpValue) < 20 || parseInt(sbpValue) > 250) ||
        !FLOAT_REGEXP.test(sbpValue)
    )) {
    errors.sbpValue = '20,250'
  } else if ((condition === optionValue[2] || condition === optionValue[3]) &&
      (R.isNil(sbpValue) || (parseInt(sbpValue) < 0 || parseInt(sbpValue) > 100) ||
        !FLOAT_REGEXP.test(sbpValue)
    )) {
    errors.sbpValue = '0,100'
  }

  return errors
}
