import formSBPValidate from 'common/modules/sbp/validator'

export default (state) => {
  let errors = {}
  errors.FormSBP = formSBPValidate(state)
  return errors
}
