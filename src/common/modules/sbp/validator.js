import R from 'ramda'
// For now not only simulate would call, and components would check the vaule to tip user
// simulate -> NeedMinMax
export const ERROR_MISS_DATA = 'miss'

const validate = (values) => {
  const sbpValues = (values && values.FormSBP)
    ? values.FormSBP : {}
  return baseValidate(true)(sbpValues)
}

export default validate

// For now use only for predict
export const isValidate = R.curry((isForSimulate, data) => {
  return Object.keys(baseValidate(isForSimulate)(data)).length == 0
    && parseFloat(data.dryweight) > 0
    && parseFloat(data.age) > 0
    && parseFloat(data.temperature) > 0
})

const baseValidate = isForSimulate => values => {
  return {
    ...validateDataNull(values),
    ...validateConductivity(isForSimulate)(values),
    ...validateDiaTempValue(isForSimulate)(values),
    ...validateUf(isForSimulate)(values),
    ...validateBloodFlow(isForSimulate)(values),
    ...validateTotalUf(isForSimulate)(values),
    ...validateDiaFlow(isForSimulate)(values),
    ...validateNS(isForSimulate)(values),
    ...validateDryWeight(isForSimulate)(values),
  }
}

const validateDryWeight = unSkipValidate => values => {
  let errors = {}
  const field = 'dryweight'
  if (parseFloat(values[field]) <= 0) {
    errors[field] = 'dryweight >0'
  }
  return errors
}

const validateNumberic = (values, field, errors, errMsg) => {
  // format: -123.12345 or 123.12345 or 123
  // start from a zero or -zero is not allowed ( -01) ( 09)
  // start from a point is not allowed ( .999)
  const FLOAT_REGEXP = new RegExp(/^\-?([1-9]+\d+\.?\d*)$|^\-?(\d{1}\.{1}\d*)$|^\-?\d{1}$/)
  if (!FLOAT_REGEXP.test(values[field])) {
    errors[field] = errMsg
  }
  return errors
}

const validateRequired = (values, field, errors, errMessage = 'Required') => {
  if (!values[field] && values[field] != 0) {
    errors[field] = errMessage
  }

  return errors
}

const validateMinMaxByOperation = unSkipValidate => (values, field, min, max, errors, errMsg) => {
  if (unSkipValidate) {
    return validateMinMax(values, field, min, max, errors, errMsg)
  } else {
    return  errors
  }
}

const validateMinMax = (values, field, min, max, errors, errMsg) => {
  if (parseFloat(values[field]) < min || parseFloat(values[field]) > max) {
    errors[field] = errMsg
  }
  return errors
}

const validateConductivity = unSkipValidate => values => {
  let errors = {}
  const field = 'conductivity'
  const errMsg = '13.6,14.5'
  errors = validateNumberic(values, field, errors, errMsg)
  errors = validateMinMaxByOperation(unSkipValidate)(values, field, 13.6, 14.5, errors, errMsg)
  errors = validateRequired(values, field, errors, errMsg)
  return errors
}

const validateDiaTempValue = unSkipValidate => values => {
  let errors = {}
  const field = 'dia_temp_value'
  const errMsg = '35,37'
  errors = validateNumberic(values, field, errors, errMsg)
  errors = validateMinMaxByOperation(unSkipValidate)(values, field, 35, 37, errors, errMsg)
  return validateRequired(values, field, errors, errMsg)
}

const validateUf = unSkipValidate => values => {
  let errors = {}
  const field = 'uf'
  const errMsg = '0,10'
  errors = validateNumberic(values, field, errors, errMsg)
  errors = validateMinMaxByOperation(unSkipValidate)(values, field, 0, 10, errors, errMsg)
  return validateRequired(values, field, errors, errMsg)
}

const validateTotalUf = unSkipValidate => values => {
  let errors = {}
  const field = 'total_uf'
  const errMsg = '0,8'
  errors = validateNumberic(values, field, errors, errMsg)
  errors = validateMinMaxByOperation(unSkipValidate)(values, field, 0, 8, errors, errMsg)
  return validateRequired(values, field, errors, errMsg)
}

const validateBloodFlow = unSkipValidate => values => {
  let errors = {}
  const field = 'blood_flow'
  const errMsg = '150,450'
  errors = validateNumberic(values, field, errors, errMsg)
  errors = validateMinMaxByOperation(unSkipValidate)(values, field, 150, 450, errors, errMsg)
  return validateRequired(values, field, errors, errMsg)
}


const validateDiaFlow = unSkipValidate => values => {
  let errors = {}
  const field = 'dia_flow'
  const errMsg = '300,1000'
  errors = validateNumberic(values, field, errors, errMsg)
  errors = validateMinMaxByOperation(unSkipValidate)(values, field, 300, 1000, errors, errMsg)
  return validateRequired(values, field, errors, errMsg)
}

// for now, ns could skip in simulate, because the 1/86 percent that vip have this field
const validateNS = unSkipValidate => values => {
  let errors = {}
  if (!unSkipValidate) {
    return errors
  }
  const field = 'ns'
  const errMsg = '0,500'
  errors = validateNumberic(values, field, errors, errMsg)
  errors = validateMinMaxByOperation(unSkipValidate)(values, field, 0, 500, errors, errMsg)
  return validateRequired(values, field, errors, errMsg)
}

const validateDataNull =  values => {
  let errors = {}
  Object.keys(values).forEach(field => {
    if ((typeof values[field] != 'string' && R.isNil(values[field])) || values[field] == -9527) {
      errors[field] = ERROR_MISS_DATA
    }
  })
  return errors
}
