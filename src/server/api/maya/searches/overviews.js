import Overview from 'server/models/maya/searches/overviews'
import Protos from 'common/protos'

export default class Overviews {
  *fetch() {
    this.models = this.models || Overview
    const ctx = this
    const shift = ctx.params.shift
    const hemarea = ctx.query.hemarea
    const overviews = yield this.models.getOverviews(shift, hemarea)
    const overviewsBuffer = Protos.Overview.response.encode(overviews).toBuffer()
    ctx.body = overviewsBuffer
    ctx.type = 'application/octet-stream'
  }

  *fetchAbnormal() {
    this.models = this.models || Overview
    const ctx = this
    const shift = ctx.params.shift
    const c_id = ctx.params.c_id
    const hemarea = ctx.query.hemarea
    const abnormals = yield this.models.getAbnormals(shift, c_id, hemarea)
    const abnormalsBuffer = Protos.OverviewAbnormal.response.encode(abnormals).toBuffer()
    ctx.body = abnormalsBuffer
    ctx.type = 'application/octet-stream'
  }
}
