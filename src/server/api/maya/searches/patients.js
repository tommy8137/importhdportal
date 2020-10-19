import Patient from 'server/models/maya/searches/patients'
import Dashboards from 'server/models/maya/searches/dashboards'
import Tests from 'server/models/maya/searches/tests'
import Records from 'server/models/maya/searches/records'
import Protos from 'common/protos'
import { validateDateFormat, validateDateRange } from 'server/utils/api-validate-parameter'

export default class Patients {

  *fetchPatient() {
    this.models = this.models || Patient
    const ctx = this
    const patientId = ctx.params.p_id
    const patient = yield this.models.getPatients(patientId)
    const patientsBuffer = Protos.Patient.response.encode(patient).toBuffer()
    ctx.body = patientsBuffer
    ctx.type = 'application/octet-stream'
  }

  *fetchDashboard() {
    this.models = this.models || Dashboards
    const ctx = this
    const patientId = ctx.params.p_id
    const recordId = ctx.params.r_id
    const notesformat = ctx.query.notesformat
    const dashboards = yield this.models.getDashboards(patientId, recordId, notesformat)
    const dashboardsBuffer = Protos.Dashboard.response.encode(dashboards).toBuffer()
    ctx.body = dashboardsBuffer
    ctx.type = 'application/octet-stream'
  }

  *listRecord() {
    this.models = this.models || Records
    const ctx = this
    const patientId = ctx.params.p_id
    const startDate = ctx.query.start_date
    const endDate = ctx.query.end_date
    const offset = ctx.query.offset
    const limit = ctx.query.limit

    validateDateFormat(startDate, endDate)
    validateDateRange(startDate, endDate)
    const records = yield this.models.getRecords(patientId, startDate, endDate, offset, limit)
    const recordsBuffer = Protos.RecordList.response.encode(records).toBuffer()
    ctx.body = recordsBuffer
    ctx.type = 'application/octet-stream'
  }

  *fetchRecord() {
    this.models = this.models || Records
    const ctx = this
    const patientId = ctx.params.p_id
    const recordId = ctx.params.r_id
    const enableSbpAlarm = ctx.query.sbp_alarm
    const notesformat = ctx.query.notesformat
    const record = yield this.models.getRecord(patientId, recordId, enableSbpAlarm, notesformat)
    let recordBuffer
    switch (notesformat)
    {
      case "dart":
        recordBuffer = Protos.RecordDart.response.encode(record).toBuffer()
        break;
      default:
        recordBuffer = Protos.Record.response.encode(record).toBuffer()
        break;
    }
    ctx.body = recordBuffer
    ctx.type = 'application/octet-stream'
  }

  *listRisks() {
    this.models = this.models || Patient
    const ctx = this
    const patientId = ctx.params.p_id
    const recordId = ctx.params.r_id
    const risks = yield this.models.getRisks(patientId, recordId)
    const risksBuffer = Protos.RiskSummary.response.encode(risks).toBuffer()
    ctx.body = risksBuffer
    ctx.type = 'application/octet-stream'
  }

  *fetchItem() {
    this.models = this.models || Tests
    const ctx = this
    const patientId = ctx.params.p_id
    const itemId = ctx.params.ti_id
    const startDate = ctx.query.start_date
    const endDate = ctx.query.end_date
    const limit = ctx.query.limit
    const offset = ctx.query.offset
    const items = yield this.models.getTestItems(patientId, itemId, startDate, endDate, offset, limit)
    const itemsBuffer = Protos.Item.response.encode(items).toBuffer()
    ctx.body = itemsBuffer
    ctx.type = 'application/octet-stream'
  }

  *fetchResultList() {
    this.models = this.models || Tests
    const ctx = this
    const patientId = ctx.params.p_id
    const queryString = ctx.query
    const startDate = queryString.start_date
    const endDate = queryString.end_date
    const offset = queryString.offset
    const limit = queryString.limit
    const results = yield this.models.getTestResults(patientId, startDate, endDate, offset, limit)
    const resultsBuffer = Protos.ResultList.response.encode(results).toBuffer()
    ctx.body = resultsBuffer
    ctx.type = 'application/octet-stream'
  }

  *fetchResult() {
    this.models = this.models || Tests
    const ctx = this
    const patientId = ctx.params.p_id
    const resultId = ctx.params.tr_id
    const result = yield this.models.getTestResult(patientId, resultId)
    const resultBuffer = Protos.Result.response.encode(result).toBuffer()
    ctx.body = resultBuffer
    ctx.type = 'application/octet-stream'
  }

}
