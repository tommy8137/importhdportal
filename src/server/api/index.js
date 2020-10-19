import router from 'koa-router'
import apiRouterV2maya from './maya/index'

const apiRouter = new router()

apiRouter.use('/maya', apiRouterV2maya.routes())

export default apiRouter
