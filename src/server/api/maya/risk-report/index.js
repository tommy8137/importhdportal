import Report from 'server/models/maya/risk-report'

export default class Reports {
  *genReport() {
    const ctx = this
    const date = ctx.params.date.toString()
    const csv = yield Report.getReport(date)
    ctx.body = csv
    ctx.type = 'text/csv'
    ctx.attachment(`report-${date}.csv`)
  }
}
