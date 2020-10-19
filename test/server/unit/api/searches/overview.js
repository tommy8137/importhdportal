import Protos from 'common/protos'
import co from 'co'
import Overviews from 'server/api/maya/searches/overviews.js'

describe('[unit] The fetch function in the Overviews modules', function() {
  const mockReturnValue = {
    'total': 2,
    'attended': 2,
    'not_attend': 0,
    'normal': 1,
    'abnormal': 1,
    'pie_chart': [
      {
        'c_name': '<category_A>',
        'c_id': '<c_id>',
        'number':0,
      },
      {
        'c_name': '<category_A>',
        'c_id': '<c_id>',
        'number':1,
      },
    ],
  }
  const shiftsBuffer = Protos.Overview.response.encode(mockReturnValue).toBuffer()
  const expectType = 'application/octet-stream'
  const overviewsObj = new Overviews()
  // -----------------------------------------------------------------------------
  it('should call the getOverviews with specific arguments', async () => {
    const genThis = function () {
      return {
        models: {
          getOverviews: jest.fn(
            function* getOverviews() {
              return mockReturnValue
            }
          ),
        },
        params: {
          shift: 'morning|mid|evening|all',
        },
        query: {
          hemarea : 'A',
        },
      }
    }
    const Mock = jest.fn().mockImplementation(genThis)
    const mock = new Mock()
    await co(overviewsObj.fetch.apply(mock))
    expect(mock.models.getOverviews.mock.calls[0])
      .toEqual(['morning|mid|evening|all', 'A'])
  })
  // -----------------------------------------------------------------------------
  it('should return the overview', async () => {
    const genThis = function () {
      return {
        models: {
          getOverviews: jest.fn(
            function* getOverviews() {
              return mockReturnValue
            }
          ),
        },
        params: {
          shift: 'morning|mid|evening|all',
        },
        query: {

        },
      }
    }
    const Mock = jest.fn().mockImplementation(genThis)
    const mock = new Mock()
    await co(overviewsObj.fetch.apply(mock))
    expect(mock.body).toEqual(shiftsBuffer)
    expect(mock.type).toEqual(expectType)
  })

  // -----------------------------------------------------------------------------
  it('should import Overview models when this.modules does not exist.', async () => {
    const genThis = function () {
      return {
        params: {
          shift: 'morning',
        },
        query: {

        },
      }
    }
    co(overviewsObj.fetch.apply(genThis())).then( successHandler, errorHnadler)
  })
})

describe('[unit] The fetchAbnormal function in the Overviews modules', function() {
  const mockReturnValue =   {
    'abnormal_list': [
      {
        'name': '<name>',
        'gender': '<F|M>',
        'patient_id': '<p_id>',
        'bed_no': '<bed_no>',
        'r_id': '<r_id>',
        'age': 18,
        'risk_category':
        [
          {
            'c_id': '<c_id>',
            'c_name': '<c_name>',
            // 'm_id': '<m_id>', api.md failure?
            // 'm_name': '<m_name>'
          },
        ],
      },
    ],
  }
  const shiftsBuffer = Protos.OverviewAbnormal.response.encode(mockReturnValue).toBuffer()
  const expectType = 'application/octet-stream'
  const overviewsObj = new Overviews()
  // -----------------------------------------------------------------------------
  it('should call the getAbnormals with specific arguments', async () => {
    const genThis = function () {
      return {
        models: {
          getAbnormals: jest.fn(
            function* getAbnormals() {
              return mockReturnValue
            }
          ),
        },
        params: {
          shift: 'morning|mid|evening|all',
          c_id: 'category id|all',
        },
        query: {
          hemarea : 'A',
        },
      }
    }
    const Mock = jest.fn().mockImplementation(genThis)
    const mock = new Mock()
    await co(overviewsObj.fetchAbnormal.apply(mock))
    expect(mock.models.getAbnormals.mock.calls[0])
      .toEqual(['morning|mid|evening|all', 'category id|all', 'A'])
  })
  // -----------------------------------------------------------------------------
  it('should return the overviewAbnormal', async () => {
    const genThis = function () {
      return {
        models: {
          getAbnormals: jest.fn(
            function* getAbnormals() {
              return mockReturnValue
            }
          ),
        },
        params: {
          shift: 'morning|mid|evening|all',
          c_id: 'category id|all',
        },
        query: {

        },
      }
    }
    const Mock = jest.fn().mockImplementation(genThis)
    const mock = new Mock()
    await co(overviewsObj.fetchAbnormal.apply(mock))
    expect(mock.body).toEqual(shiftsBuffer)
    expect(mock.type).toEqual(expectType)
  })

  // -----------------------------------------------------------------------------
  it('should import Overview models when this.modules does not exist.', async () => {
    const genThis = function () {
      return {
        params: {
          shift: 1,
          c_id: 'all',
        },
        query: {

        },
      }
    }
    co(overviewsObj.fetchAbnormal.apply(genThis())).then( successHandler, errorHnadler)
  })
})

const successHandler = function() {

}
const errorHnadler = function(err) {
  console.warn(err)
}
