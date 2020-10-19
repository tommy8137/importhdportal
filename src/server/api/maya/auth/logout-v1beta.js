import authHelper, { COOKIE_AUTH_TOKEN } from 'server/helpers/server-auth-helper'

export default class Logout {

  //TODO this func name is bad, must figure out a name like facebook, github, google etc.
  *jwt() {
    const ctx = this
    // yield authHelper.logout(ctx.state.token)
    ctx.cookies.set(COOKIE_AUTH_TOKEN, null)
    ctx.cookies.set('timeout', null)
    ctx.cookies.set('agreements', null)
    ctx.type = 'application/json'
    ctx.body = JSON.stringify('log out successfully')
  }
}
