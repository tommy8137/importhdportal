export const MIN_LENGTH = 2
export const MAX_LENGTH = 30
export const validate = (values) => {
  const errors = {}
  if (!values.username || values.username.length < MIN_LENGTH || values.username.length > MAX_LENGTH) {
    errors.username = "Account must between %s to %s"
  }

  if (!values.password || values.password.length < MIN_LENGTH || values.password.length > MAX_LENGTH) {
    errors.password = "Password must between %s to %s"
  }

  return errors
}
