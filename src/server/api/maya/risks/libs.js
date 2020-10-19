import Risks from 'server/models/maya/risks/risks'
import Protos from 'common/protos'

export default class Libs {
  *fetchLibs() {
    this.models = this.models || Risks
    const ctx = this
    const libs = yield this.models.getLibs(ctx.query.lang)
    const libsBuffer = Protos.Libs.response.encode(libs).toBuffer()
    ctx.body = libsBuffer
    ctx.type = 'application/octet-stream'
  }
}
