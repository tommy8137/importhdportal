import router from 'koa-router'
import adminsRouter from './admins'
import authRouter from './auth'
import searchesRouter from './searches'
import RisksRouter from './risks'
import usersRouter from './users'
import alarmRouter from './alarm'
import effectiveRouter from './effective'
import Report from './risk-report'
const apiRouter = new router()
const report = new Report()
apiRouter.use('/admins', adminsRouter.routes())
apiRouter.use('/auth', authRouter.routes())
apiRouter.use('/searches', searchesRouter.routes())
apiRouter.use('/risks', RisksRouter.routes())
apiRouter.use('/users', usersRouter.routes())
apiRouter.use('/alarm', alarmRouter.routes())
apiRouter.use('/effective', effectiveRouter.routes())
apiRouter.get('/reports/:date', report.genReport)
export default apiRouter
