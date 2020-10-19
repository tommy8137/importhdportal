import router from 'koa-router'
import PassportHelper from 'server/helpers/passport'
import Agreements from './agreements'
import Settings from './settings'
import licenses from 'server/middlewares/licenses'

const usersRouter = new router()

usersRouter.use(PassportHelper.allow('doctor'))
usersRouter.use(licenses)

const agreements = new Agreements()
usersRouter.get('/agreements', agreements.fetch)
usersRouter.put('/agreements', agreements.update)

const settings = new Settings()
usersRouter.get('/settings', settings.fetch)

export default usersRouter
