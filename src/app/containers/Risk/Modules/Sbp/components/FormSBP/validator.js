export default values => {
  const sbpValues = (values && values.FormSBP)
    ? values.FormSBP : {}
  return {
    ...validateConductivity(sbpValues),
    ...validateDiaTempValue(sbpValues),
    ...validateUf(sbpValues),
    ...validateBloodFlow(sbpValues),
    ...validateDialysateca1(sbpValues),
    ...validateDiaFlow(sbpValues),
    ...validateTMP(sbpValues),
  }
}

function validateNumberic(values, field, errors, errMsg) {
  // format: -123.12345 or 123.12345 or 123
  // start from a zero or -zero is not allowed ( -01) ( 09)
  // start from a point is not allowed ( .999)
  const FLOAT_REGEXP = new RegExp(/^\-?([1-9]+\d+\.?\d*)$|^\-?(\d{1}\.{1}\d*)$|^\-?\d{1}$/)
  if (!FLOAT_REGEXP.test(values[field])) {
    errors[field] = errMsg
  }
  return errors
}

function validateRequired(values, field, errors, errMessage = 'Required') {
  if (!values[field] && values[field] != 0) {
    errors[field] = errMessage
  }

  return errors
}

function validateMinMax(values, field, min, max, errors, errMsg) {
  if (parseFloat(values[field]) < min || parseFloat(values[field]) > max) {
    errors[field] = errMsg
  }
  return errors
}

function validateConductivity(values) {
  let errors = {}
  const field = 'conductivity'
  const errMsg = '12,16'
  errors = validateNumberic(values, field, errors, errMsg)
  errors = validateMinMax(values, field, 12, 16, errors, errMsg)
  errors = validateRequired(values, field, errors, errMsg)
  return errors
}

function validateDiaTempValue(values) {
  let errors = {}
  const field = 'dia_temp_value'
  const errMsg = '32,40'
  errors = validateNumberic(values, field, errors, errMsg)
  errors = validateMinMax(values, field, 32, 40, errors, errMsg)
  return validateRequired(values, field, errors, errMsg)
}

function validateUf(values) {
  let errors = {}
  const field = 'uf'
  const errMsg = '0,3'
  errors = validateNumberic(values, field, errors, errMsg)
  errors = validateMinMax(values, field, 0, 3, errors, errMsg)
  return validateRequired(values, field, errors, errMsg)
}

function validateBloodFlow(values) {
  let errors = {}
  const field = 'blood_flow'
  const errMsg = '0,400'
  errors = validateNumberic(values, field, errors, errMsg)
  errors = validateMinMax(values, field, 0, 400, errors, errMsg)
  return validateRequired(values, field, errors, errMsg)
}

function validateDialysateca1(values) {
  let errors = {}
  const field = 'dialysateca1'
  const errMsg = '2.5,3.5'
  // if (values[field] && [2.5, 3, 3.5].indexOf(parseFloat(values[field])) === -1) {
  //   errors[field] = errMsg
  // }
  errors = validateNumberic(values, field, errors, errMsg)
  errors = validateMinMax(values, field, 2.5, 3.5, errors, errMsg)
  return validateRequired(values, field, errors, errMsg)
}

function validateDiaFlow(values) {
  let errors = {}
  const field = 'dia_flow'
  const errMsg = '0,1000'
  errors = validateNumberic(values, field, errors, errMsg)
  errors = validateMinMax(values, field, 0, 1000, errors, errMsg)
  return validateRequired(values, field, errors, errMsg)
}

function validateTMP(values) {
  let errors = {}
  const field = 'tmp'
  const errMsg = '-400,350'
  errors = validateNumberic(values, field, errors, errMsg)
  errors = validateMinMax(values, field, -400, 350, errors, errMsg)
  return validateRequired(values, field, errors, errMsg)
}
