import authHelper, { COOKIE_AUTH_TOKEN } from '../helpers/server-auth-helper'
/**
 * save the token in req.token
 * @param  {[type]}   req  [description]
 * @param  {[type]}   res  [description]
 * @param  {Function} next [description]
 * @return {[type]}        [description]
 */
export default function *(next) {
	const rule = /^Bearer\s(.+)$/
	// this.state.token = req.cookies[COOKIE_AUTH_TOKEN] || ( rule.test(req.get('Authorization'))? rule.exec(req.get('Authorization'))[1]: null )
	this.state.token = this.cookies.get(COOKIE_AUTH_TOKEN) || ( rule.test(this.request.get('Authorization')) ? rule.exec(this.request.get('Authorization'))[1]: null )
	this.state.userInfo = authHelper.recoverToken(this.state.token)
	yield next
}
