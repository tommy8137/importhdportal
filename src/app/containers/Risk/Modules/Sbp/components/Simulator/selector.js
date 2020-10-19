import { createSelector } from 'reselect'
import { getFormValues, getFormSyncErrors, isInvalid } from 'redux-form'

export const reduxFormSelector = createSelector(
  getFormValues('Simulator'),
  getFormSyncErrors('Simulator'),
  isInvalid('Simulator'),
  (formValues, formErrors, formInvalid) => {
    return {
      formValues,
      formErrors,
      formInvalid,
    }
  }
)

const localeNameSelector = createSelector(
  state => state.locale,
  locale => locale.get('name')
)

export const mainSelector = createSelector(
  reduxFormSelector,
  localeNameSelector,
  (state) => (
    (state.form && state.form.Simulator && state.form.Simulator.fields)
    ? state.form.Simulator.fields
    : {}
  ),
  (simulatorForm, localeName, fields) => {
    return {
      fields,
      localeName,
      ...simulatorForm,
    }
  }
)

export default {
  mainSelector,
  reduxFormSelector,
}
