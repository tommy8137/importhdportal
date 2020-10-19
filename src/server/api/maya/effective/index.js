import router from 'koa-router'
import Effective from './effective'

const EffectiveRouter = new router()

const effective = new Effective()

EffectiveRouter.get('/year/:year/lang/:lang', effective.fetchPDF)
EffectiveRouter.get('/lists', effective.fetchList)

export default EffectiveRouter
