import router from 'koa-router'
import PassportHelper from 'server/helpers/passport'
import Logs from './logs'
import Settings from './settings'
import About from './about'
import ThresholdSetting from './thresholdSetting'
import licenses from 'server/middlewares/licenses'

export function* adminsPermission(next) {
  this.passportModels = this.passportModels ||  PassportHelper
  this.licensesModels = this.licensesModels ||  licenses
  if (!/about\/licenses$/i.test(this.path)) {
    yield this.passportModels.allow('admin').bind(this, next)
    yield this.licensesModels.bind(this, next)
  }  else {
    yield next
  }
}

const adminsRouter = new router()
adminsRouter.use(adminsPermission)

const about = new About()
adminsRouter.get('/about', about.fetch)
adminsRouter.put('/about/licenses', about.update)

const logs = new Logs()
adminsRouter.get('/logs', logs.fetch)

const settings = new Settings()
adminsRouter.get('/settings', settings.fetch)
adminsRouter.put('/settings', settings.update)

const thresholdsetting = new ThresholdSetting()
adminsRouter.get('/thresholdsetting', thresholdsetting.fetch)
adminsRouter.put('/thresholdsetting', thresholdsetting.update)

export default adminsRouter
