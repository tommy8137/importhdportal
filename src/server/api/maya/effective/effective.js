import Effective from 'server/models/maya/effective/effective'
import Protos from 'common/protos'
import getRawBody from 'raw-body'
import { errorCode, throwApiError } from 'server/helpers/api-error-helper'

export default class Effectiveness {

  *fetchPDF() {
    this.models = this.models || Effective
    const ctx = this
    const year = ctx.params.year.toString()
    const lang = ctx.params.lang.toString()
    const pdf = yield this.models.getPDF(year, lang)
    ctx.body =  pdf
    ctx.type = 'application/pdf'
    ctx.attachment(`${year}-System-Performance-Analysis-Report.pdf`)
  }

  *fetchList() {
    this.models = this.models || Effective
    const ctx = this
    const list = yield this.models.getList()
    const listBuffer = Protos.EffectiveList.response.encode(list).toBuffer()
    ctx.body =  listBuffer
    ctx.type = 'application/octet-stream'
  }
}
