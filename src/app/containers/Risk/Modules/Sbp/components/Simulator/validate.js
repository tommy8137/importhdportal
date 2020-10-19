// Force validate, when form values has been changed
// https://github.com/erikras/redux-form/blob/95ea6f5ec0db36ee3788b658835ef15271310a52/docs/api/ReduxForm.md#shouldvalidateparams--boolean-optional
export const shouldValidate = (params) => {
  // force to validate anyway
  return true
  // const { nextProps, props } = params
  // return (nextProps && props) ? nextProps.values != props.values : false
}
