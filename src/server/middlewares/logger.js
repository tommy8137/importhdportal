import RotatingFileStream from 'rotating-file-stream'
import fs from 'fs'
import morgan from 'koa-morgan'

const { logFolder } = global.config

// ensure log directory exists
fs.existsSync(logFolder) || fs.mkdirSync(logFolder)

// create a rotating write stream
const accessLogStream = RotatingFileStream('access.log', {
  path: logFolder,
  interval: '1d',
})

morgan.token('date', () => {
  return new Date().toString()
})
// setup the logger
const logger = morgan.middleware('combined', { stream: accessLogStream })
export default logger

