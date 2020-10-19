import router from 'koa-router'
import PassportHelper from 'server/helpers/passport'
import Alarm from './alarm'
import Sbp from './sbp'
import licenses from 'server/middlewares/licenses'

const AlarmRouter = new router()

AlarmRouter.use(PassportHelper.allow('doctor'))
AlarmRouter.use(licenses)

const alarm = new Alarm()

AlarmRouter.get('/phrase', alarm.fetchList)

const sbp = new Sbp()

AlarmRouter.put('/sbp/status', sbp.updateSbp)

export default AlarmRouter
