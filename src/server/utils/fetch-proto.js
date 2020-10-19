import fetch from 'isomorphic-fetch'
import merge from 'lodash.merge'
import stream from 'stream'

export const resolveBuffer = body => new Promise((resolve, reject) => {
	const chunks = []
	body.on('data', chunk => {
		chunks.push(chunk)
	});

	body.on('end', () => {
		const buffer = Buffer.concat(chunks)
		resolve(buffer)
	})
	body.on('error', (e) => {
		reject(e)
	})
})

export default (url, options) => {
	const body = options.body
	options = merge({ headers: { 'Content-Type': 'application/octet-stream', Accept: 'application/octet-stream' } }, options)
	if (body) {
		const bufferStream = new stream.PassThrough()
		bufferStream.end(body)
		options.body = bufferStream
	}
	return fetch(url, options)
		.then(response => {
			if (response.status != 200) {
				const error = new Error('Failed to get api data')
				error.response = response
				error.status = response.status
				throw error
			}
			return resolveBuffer(response.body)
		})
		.then(buf => buf)
}
