import Protos from 'common/protos'
import AlarmModel from 'server/models/maya/alarm/alarm'

export default class Accuracies {

  *fetchList() {
    this.models = this.models || AlarmModel
    const ctx = this
    const notesformat = ctx.query.notesformat
    const list = yield this.models.getAlarmList(notesformat)
    let listBuffer
    switch (notesformat)
    {
      case "dart":
        listBuffer = Protos.DartList.response.encode(list).toBuffer()
        break;
      default:
        listBuffer = Protos.AlarmList.response.encode(list).toBuffer()
        break;
    }
    ctx.body = listBuffer
    ctx.type = 'application/octet-stream'
  }
}
