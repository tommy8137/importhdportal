import router from 'koa-router'
import PassportHelper from 'server/helpers/passport'
import Categories from './categories'
import Libs from './libs'
import PersonalThreshold from './personalThreshold'
import licenses from 'server/middlewares/licenses'

const RisksRouter = new router()

RisksRouter.use(PassportHelper.allow('doctor'))
RisksRouter.use(licenses)

const categories = new Categories()
const libs = new Libs()
const personalThreshold = new PersonalThreshold()

RisksRouter.get('/categories/:c_id/modules/:m_id/access', categories.fetchAccess)
RisksRouter.post('/categories/:c_id/modules/:m_id/charts', categories.fetchCharts)
RisksRouter.get('/libs', libs.fetchLibs)

RisksRouter.get('/systemthreshold/:r_id', personalThreshold.fetchSysThreshold)
RisksRouter.put('/setpersonalthreshold', personalThreshold.setPersonalThreshold)
export default RisksRouter
