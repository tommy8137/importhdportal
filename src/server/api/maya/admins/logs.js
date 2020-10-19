import moment from 'moment'
import FileProcess from 'server/utils/file-process'

const COMPRESS_FILE_EXTENSION = '.log'
const { logFolder } = global.config

export default class Logs {

  *fetch() {
    this.models = this.models || FileProcess
    const ctx = this
    const logFileName = moment().format("YYYYMMDDhmmss")
    ctx.attachment(`${logFileName}.zip`)
    ctx.body = yield this.models.getCompressZipFile(ctx.res, logFolder, COMPRESS_FILE_EXTENSION)
  }
}
