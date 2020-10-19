import matchRoutes from './match-routes'
import co from 'co'

const renderToString = (id, requestState) => function* () {
  try {
    const result = yield matchRoutes(requestState)
    return result
  } catch (ex) {
    return {
      timeout: ex.timeout,
      status: ex.status || 500,
      message: ex.message,
      code: ex.code || 1006,
    }
  }
}

export default renderToString
