import { errorCode } from 'server/helpers/api-error-helper'
import Protos from 'common/protos'

export default function *(next) {
  try {
    yield next
  } catch (err) {
    switch(err.code) {
      case errorCode.AUTH_WRONG:
      case errorCode.UNAUTHORIZED:
        err.status = 401
        break
      case errorCode.MODIFY_COLUMN_NULL:
      case errorCode.URL_VAR_NULL:
      case errorCode.PROTOBUFJS_ERROR:
      case errorCode.FORM_DATA_ERROR:
      case errorCode.MODULE_FILE_FORMAT_ERROR:
      case errorCode.FILE_DECOMPRESS_ERROR:
      case errorCode.UPLOAD_FILES_ERROR:
      case errorCode.PREDICT_NULL:
      case errorCode.PMODULE_NOT_FOUND:
      case errorCode.ACCESS_DENY:
      case errorCode.CRYPT_FAIL:
      case errorCode.PROTOS_NOT_FOUND:
      case errorCode.JSON_PARSE_ERROR:
      case errorCode.PREDICT_INPUT_ERROR:
      case errorCode.REQUEST_DATA_EMPTY:
      case errorCode.REQUEST_FORMAT_ERROR:
      case errorCode.REQUEST_NOT_FOUND:
        err.status = 400
        break
      case errorCode.LICENSE_EXPIRED:
        err.status = 403
        break
      case errorCode.MODULE_NOT_FOUND:
        err.status = 404
        break
      case errorCode.METHOD_WRONG:
        err.status = 405
        break
      case errorCode.NOT_PROTOBUF:
        err.status = 415
        break
      case errorCode.UNPROCESSABLE:
        err.status = 422
        break
      case errorCode.INTERNAL_ERROR:
      case errorCode.DB_CONNECT_ERROR:
      case errorCode.DB_QUERY_ERROR:
      case errorCode.RW_FILE_ERROR:
      case errorCode.DB_ERROR:
        err.status = 500
        break
      default:
        err.status = err.statusCode || 500
        this.app.emit('error', err, this)
        break
    }
    console.log(err)
    this.throw(err)
  }
}

export function *slackReportBot(next) {
	try {
		yield next
	} catch (err) {
		console.log('errbot')
		const payload = {
			'username': 'universal webserver bot',
			'icon_emoji': ':imp:',
	    'attachments': [
        {
        	fallback: `server gg: ${err.message}`,
          authur: `*${err.message}*`,
          title: `${this.request.method}: ${this.originalUrl}`,
          color: 'danger',
          pretext: "universal web server error occurred!",
          text: `${err.stack}`,
          mrkdwn_in: [
              // "text",
              // "pretext"
          ]
        }
	    ]
		}
		console.log(payload)
		replaceSpecials(payload.attachments[0])
		const result = yield sendToSlack(payload)
		this.throw(err)
		// console.log(result)
	}
}

function sendToSlack(payload) {
	console.log(payload)
	const url = global.config.slackWebHook
	return fetch(url, { body: JSON.stringify(payload), method:'post', headers: { 'Content-Type': 'application/json' } })
		.then(res => {
			if (res.status !== 200) {
				console.log('errr when sending to slack channel', res.status, res.statusText)
			}
			return res.text()
		})

}

function replaceSpecials(attachment) {
	for (let p in attachment) {
		if (typeof attachment[p] !== 'string') {
			continue
		}

		attachment[p] = attachment[p].replace(/&/g, '&amp;')
		attachment[p] = attachment[p].replace(/</g, '&lt;')
		attachment[p] = attachment[p].replace(/>/g, '&gt;')
	}
}
