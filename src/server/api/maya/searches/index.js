import router from 'koa-router'
import PassportHelper from 'server/helpers/passport'
import Schedules from './schedules'
import Overviews from './overviews'
import Patients from './patients'
import Shifts from './shifts'
import licenses from 'server/middlewares/licenses'

const searchesRouter = new router()

searchesRouter.use(PassportHelper.allow('doctor'))
searchesRouter.use(licenses)

const overviews = new Overviews()
searchesRouter.get('/overviews/:shift', overviews.fetch)
searchesRouter.get('/overviews/:shift/abnormals/:c_id', overviews.fetchAbnormal)

const patients = new Patients()
searchesRouter.get('/patients/:p_id', patients.fetchPatient)
searchesRouter.get('/patients/:p_id/dashboards/:r_id', patients.fetchDashboard)
searchesRouter.get('/patients/:p_id/records', patients.listRecord)
searchesRouter.get('/patients/:p_id/records/:r_id', patients.fetchRecord)
searchesRouter.get('/patients/:p_id/risks/:r_id', patients.listRisks)
searchesRouter.get('/patients/:p_id/test_items/:ti_id', patients.fetchItem)
searchesRouter.get('/patients/:p_id/test_results', patients.fetchResultList)
searchesRouter.get('/patients/:p_id/test_results/:tr_id', patients.fetchResult)

const schedules = new Schedules()
searchesRouter.get('/schedules', schedules.list)

const shifts = new Shifts()
searchesRouter.get('/shifts', shifts.fetchShift)

export default searchesRouter
