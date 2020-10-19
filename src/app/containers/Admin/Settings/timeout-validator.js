

export default (values) => {
  const errors = {}
  const G0026 = 'Please enter 1 to 240.'
  if (!values.timeout) {
    errors.timeout = G0026
  } else if (values.timeout < 1 || values.timeout > 240) {
    errors.timeout = G0026
  }

  return errors
}
