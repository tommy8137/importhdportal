import Protos from 'common/protos'
import co from 'co'
import Libs from 'server/api/maya/risks/libs.js'

describe('[unit] The fetchLibs function in the Libs modules', function() {
  const mockReturnValue = {
    'categories':
    [
      {
        'c_id': 1,
        'c_name': 'BP',
        'modules':
        [
          {
            'm_id': 1,
            'm_name': 'Variation',
          },
        ],
      },
    ],
  }
  const shiftsBuffer = Protos.Libs.response.encode(mockReturnValue).toBuffer()
  const expectType = 'application/octet-stream'
  const libsObj = new Libs()

  it('should call the getLibs with specific arguments', async () => {
    const genThis = function () {
      return {
        models: {
          getLibs: jest.fn(
            function* getLibs() {
              return mockReturnValue
            }
          ),
        },
        query: {
          lang: 'zh_TW|zh_CN|en_US',
        },
      }
    }
    const Mock = jest.fn().mockImplementation(genThis)
    const mock = new Mock()
    await co(
      libsObj.fetchLibs.apply(mock)
    )
    expect(mock.models.getLibs.mock.calls[0])
      .toEqual(['zh_TW|zh_CN|en_US'])
  })
  // -----------------------------------------------------------------------------
  it('should return the libs', async () => {
    const genThis = function () {
      return {
        models: {
          getLibs: jest.fn(
            function* getLibs() {
              return mockReturnValue
            }
          ),
        },
        query: {
          lang: 'zh_TW|zh_CN|en_US',
        }
      }
    }
    const Mock = jest.fn().mockImplementation(genThis)
    const mock = new Mock()
    await co(libsObj.fetchLibs.apply(mock))
    expect(mock.body).toEqual(shiftsBuffer)
    expect(mock.type).toEqual(expectType)
  })
  // -----------------------------------------------------------------------------
  it('should import Risks models when this.modules does not exist.', async () => {

    const genThis = function () {
      return {
        query: {
          lang: 'zh_TW',
        }
      }
    }
    const successHandler = function() {

    }
    const errorHnadler = function(err) {
      console.warn(err)
    }
    co(libsObj.fetchLibs.apply(genThis())).then(successHandler, errorHnadler)
  })
})
