import router from 'koa-router'
import passport from 'koa-passport'
import authenticator from 'server/middlewares/authenticator'
import Login from './login'
import Logout from './logout-v1beta'
import Refresh from './refresh'
import MayaAuth from './access-token'
import MayaLogout from './logout'

const authRouter = new router()

const login = new Login()
authRouter.post('/login', login.jwt)

const logout = new Logout()
authRouter.post('/logout-v1beta', passport.authenticate('app', { session: false }), logout.jwt)

const refresh = new Refresh()
authRouter.post('/refresh', passport.authenticate('app', { session: false }), refresh.jwt)

const auth = new MayaAuth()
authRouter.post('/access-token', auth.jwt)

const mayalogout = new MayaLogout()
authRouter.post('/logout', mayalogout.jwt)

export default authRouter
