import TYPES from 'constants/action-types'

export function setAccessToken(token) {
  return {
    type: TYPES.UNIVERSAL_SET_TOKEN,
    token
  }
}
