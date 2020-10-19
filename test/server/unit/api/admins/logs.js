import Logs from 'server/api/maya/admins/logs.js'
import co from 'co'

describe('Log api & fetch function', async() => {
  let parameters = this
  const mockFileName = 'filenmae.zip'
  parameters = {
    ...parameters,
    res:mockFileName,
    attachment:function(filename) {
    },
  }
  const logsFunc = new Logs()
  let mockReturnValue = 'not_import_stream'
  // -----------------------------------------------------------------------------
  it('[unit] should call the getCompressZipFile with specific arguments', async () => {
    let tempParamet = {
      ...parameters,
      models:{
        getCompressZipFile: jest.fn(
          function* getCompressZipFile() {
            return mockReturnValue
          }
        ),
      },
    }

    const genThis = function () {
      return tempParamet
    }
    const Mock = jest.fn().mockImplementation(genThis)
    const mock = new Mock()
    await co(logsFunc.fetch.apply(mock))
    const result = mock.models.getCompressZipFile.mock.calls[0]
    expect(result[0]).toEqual(mockFileName)
    expect(result[2]).toEqual('.log')
  })

  // -----------------------------------------------------------------------------
  it('[unit] should return the Log', async () => {
    let tempParamet = {
      ...parameters,
      models:{
        getCompressZipFile: jest.fn(
          function* getCompressZipFile() {
            return mockReturnValue
          }
        ),
      },
    }

    const genThis = function () {
      return tempParamet
    }
    const Mock = jest.fn().mockImplementation(genThis)
    const mock = new Mock()
    await co(logsFunc.fetch.apply(mock))
    expect(mock.body).toEqual(mockReturnValue)
      // Content-Disposition字段，设为“attachment
  })

  // -----------------------------------------------------------------------------
  it('[unit] should import FileProcess when this.models does not exist.', async () => {
    let tempParamet = {
      ...parameters,
    }
    const genThis = function () {
      return tempParamet
    }
    co(logsFunc.fetch.apply(genThis())).then(successHandler, errorHnadler)
  })

})

const successHandler = function() {

}
const errorHnadler = function(err) {
  // console.warn(err)
}
