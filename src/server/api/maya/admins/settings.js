import getRawBody from 'raw-body'
import SettingsModel from 'server/models/maya/admins/settings'
import Protos from 'common/protos'
import { errorCode, throwApiError } from 'server/helpers/api-error-helper'

export default class Settings {

  *update() {
    this.models =  this.models || SettingsModel
    const ctx = this
    const doctorId = ctx.state.user.id
    if (!ctx.is('application/octet-stream')) {
      throwApiError('The request should be Protocol buffer', errorCode.NOT_PROTOBUF)
    }
    const requestBufferData = yield getRawBody(ctx.req)
    const settingResult = Protos.Setting.request.decode(requestBufferData)
    if (settingResult.timeout_minute === 0) {
      throwApiError('modify column can not be null', errorCode.MODIFY_COLUMN_NULL)
    }
    const updateSettingResult = yield this.models.updateSettings(doctorId, settingResult)
    const settingBuffer = Protos.Setting.response.encode(updateSettingResult).toBuffer()
    ctx.body = settingBuffer
    ctx.type = 'application/octet-stream'
  }

  *fetch() {
    this.models =  this.models || SettingsModel
    const ctx = this
    const doctorId = ctx.state.user.id
    const timeoutMinute = yield this.models.getSettings(doctorId)
    const settingBuffer = Protos.Setting.response.encode(timeoutMinute).toBuffer()
    ctx.body = settingBuffer
    ctx.type = 'application/octet-stream'
  }
}
