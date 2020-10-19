import formSBPValidate from 'common/modules/sbp/validator'
import formSettingValidate from './components/FormSetting/validator'

export default (state) => {
  let errors = {}
  errors.FormSBP = formSBPValidate(state)
  errors.FormSetting = formSettingValidate(state)
  return errors
}
