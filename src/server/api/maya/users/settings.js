import getRawBody from 'raw-body'
import SettingsModel from 'server/models/maya/admins/settings'
import Protos from 'common/protos'

export default class Settings {

  *fetch() {
    this.models = this.models || SettingsModel
    const ctx = this
    const doctorId = ctx.state.user.id
    const timeoutMinute = yield this.models.getSettings(doctorId)
    const settingBuffer = Protos.Setting.response.encode(timeoutMinute).toBuffer()
    ctx.cookies.set('timeout', timeoutMinute.timeout_minute, { signed: false })
    ctx.body = settingBuffer
    ctx.type = 'application/octet-stream'
  }
}
