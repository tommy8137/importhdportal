import Protos from 'common/protos'
import co from 'co'
import Categories from 'server/api/maya/risks/categories.js'
const { BPVar: varProto } = Protos
const typeis = require('type-is')

describe('[unit] The fetchCharts function in the Categories modules', function() {
  let parameters = this
  const mockReturnValue = {
    'conductivity': 1,
    'dia_temp_value': 1,
    'uf':1,
    'blood_flow': 1,
    'total_uf': 1,
    'dia_flow' :1,
    'ns': 1,
    'age': 1,
    'dm': 1,
    'temperature': 1,
    'dryweight': 1,
    'gender': '<gender>',
    'sbp': 1,
    'date': '<yyyy-mm-dd>',
  }
  const predictData = {
    conductivity: 12.1,
    dia_temp_value: 32.2,
    uf: 2.5,
    blood_flow: 100,
    total_uf:1.5,
    dia_flow: 500,
    ns: 60,
    age: 40,
    dm: 0,
    temperature: 37.1,
    dryweight: 57.5,
    gender: 'M',
    sbp: 140,
    date: '2015-01-05',
  }

  const categoriesObj = new Categories()
  const postCharts = Protos.BPVar.request.encode(predictData).toBuffer()
  const expectType = 'application/octet-stream'
  // -----------------------------------------------------------------------------
  it('should call the getCharts with specific arguments', async () => {
    const postBody = varProto.request.transform(predictData)
    const genThis = function () {
      return {
        ...parameters,
        models: {
          getCharts: jest.fn(
            function* getCharts(body, categoryId, moduleId) {
              return mockReturnValue
            }
          ),
        },
        params: {
          c_id: 1,
          m_id: 1
        },
        req:postBody,
        is : jest.fn(
          function* is(contentType) {
            if (!contentType) return typeis(this.req)
            if (!Array.isArray(contentType)) contentType = [].slice.call(arguments)
            return typeis(this.req, contentType)
          }
        ),
      }
    }
    const Mock = jest.fn().mockImplementation(genThis)
    const mock = new Mock()
    await co(categoriesObj.fetchCharts.apply(mock))
    expect(mock.models.getCharts.mock.calls[0]).toEqual([postCharts, '1', '1'])
  })
  // // -----------------------------------------------------------------------------
  it(`should throw error when body is empty`, async () => {
    const postBody = varProto.request.transform({})
    const genThis = function () {
      const data = {
        params: {
          c_id: 1,
          m_id: 1
        },
        req:postBody,
        is : jest.fn(
          function is(contentType) {
            return true
          }
        ),
      }
      return data
    }
    const Mock = jest.fn().mockImplementation(genThis)
    const mock = new Mock()
    const expectError = new Error('prediction input can not be null')
    try {
      await co(categoriesObj.fetchCharts.apply(mock))
      expect(false).toEqual(true)
    } catch(e) {
      expect(e).toEqual(expectError)
    }
  })
  // -----------------------------------------------------------------------------
  it('should throw error when body type is not application/octet-stream', async () => {
    const postBody = varProto.request.transform(predictData)
    const genThis = function () {
      const data = {
        models: {
          getCharts: jest.fn(
            function* getCharts(body, categoryId, moduleId) {
              return mockReturnValue
            }
          ),
        },
        params: {
          c_id: 1,
          m_id: 1
        },
        req:postBody,
        is : jest.fn(
          function is(contentType) {
            // fake to pretend data'type is not application/octet-stream'
            return false
          }
        ),
      }
      return data
    }

    const Mock = jest.fn().mockImplementation(genThis)
    const mock = new Mock()
    const expectError = new Error('The request should be Protocol buffer')
    try {
      await co(categoriesObj.fetchCharts.apply(mock))
      expect(false).toEqual(true)
    } catch(e) {
      expect(e).toEqual(expectError)
    }
  })
  // -----------------------------------------------------------------------------
  it('should return the predictChart', async () => {
    const postBody = varProto.request.transform(predictData)
    const genThis = function () {
      return {
        ...parameters,
        models: {
          getCharts: jest.fn(
            function* getCharts(body, categoryId, moduleId) {
              return mockReturnValue
            }
          ),
        },
        params: {
          c_id: 1,
          m_id: 1
        },
        req:postBody,
        is : jest.fn(
          function* is(contentType) {
            if (!contentType) return typeis(this.req)
            if (!Array.isArray(contentType)) contentType = [].slice.call(arguments)
            return typeis(this.req, contentType)
          }
        ),
      }
    }

    const Mock = jest.fn().mockImplementation(genThis)
    const mock = new Mock()

    await co(categoriesObj.fetchCharts.apply(mock))
    expect(mock.body).toEqual(mockReturnValue)
    expect(mock.type).toEqual(expectType)
  })
  // -----------------------------------------------------------------------------
  it('should import Risks models when this.modules does not exist1.', async () => {
    const postBody = varProto.request.transform(predictData)
    const genThis = function () {
      return {
        params: {
          c_id: 1,
          m_id: 1
        },
        req:postBody,
        is : jest.fn(
          function* is(contentType) {
            return true
          }
        ),
      }
    }
    const successHandler = function() {

    }
    const errorHnadler = function(err) {
      // console.warn(err)
    }
    co(categoriesObj.fetchCharts.apply(genThis())).then(successHandler, errorHnadler)
  })
})

// describe('[unit] The fetchRemindings function in the Categories modules', function() {
//   const mockReturnValue = {
//     'remindings':'<reminding>',
//   }
//
//   const predictData = {
//     conductivity: 12.1,
//     dia_temp_value: 32.2,
//     uf: 2.5,
//     blood_flow: 100,
//     total_uf:1.5,
//     dia_flow: 500,
//     ns: 60,
//     age: 40,
//     dm: 0,
//     temperature: 37.1,
//     dryweight: 57.5,
//     gender: 'M',
//     sbp: 140,
//     date: '2015-01-05'
//   }
//
//   const body = Protos.Reminding.request.encode(predictData).toBuffer()
//   const expectType = 'application/octet-stream'
//   const categoriesObj = new Categories()
//
//   // -----------------------------------------------------------------------------
//   // Test cases
//   // -----------------------------------------------------------------------------
//   it('should call the getRemindings with specific arguments', async () => {
//     const postBody = varProto.request.transform(predictData)
//     const genThis = function () {
//       return {
//         models: {
//           getRemindings: jest.fn(
//             function* getRemindings() {
//               return mockReturnValue
//             }
//           ),
//         },
//         params: {
//           c_id: 1,
//           m_id: 1
//         },
//         req:postBody,
//         is : jest.fn(
//           function* is(contentType) {
//             if (!contentType) return typeis(this.req)
//             if (!Array.isArray(contentType)) contentType = [].slice.call(arguments)
//             return typeis(this.req, contentType)
//           }
//         ),
//       }
//     }
//     const Mock = jest.fn().mockImplementation(genThis)
//     const mock = new Mock()
//
//     await co(categoriesObj.fetchRemindings.apply(mock))
//     expect(mock.models.getRemindings.mock.calls[0])
//       .toEqual([body, 1, 1])
//   })
//
//   // -----------------------------------------------------------------------------
//   it('should throw error when body type is not application/octet-stream', async () => {
//     const postBody = varProto.request.transform(predictData)
//     const genThis = function () {
//       const data = {
//         models: {
//           getRemindings: jest.fn(
//             function* getRemindings() {
//               return mockReturnValue
//             }
//           ),
//         },
//         params: {
//           c_id: 1,
//           m_id: 1
//         },
//         req:postBody,
//         is : jest.fn(
//           function is(contentType) {
//             // fake to pretend data'type is not application/octet-stream'
//             return false
//           }
//         ),
//       }
//       return data
//     }
//
//     const Mock = jest.fn().mockImplementation(genThis)
//     const mock = new Mock()
//     const successHandler = function() {
//       expect(false).toEqual(true)
//     }
//     const errorHnadler = function(err) {
//
//     }
//     try {
//       await co(categoriesObj.fetchRemindings.apply(mock))
//       expect(false).toEqual(true)
//     } catch(e) {
//       expect(e).toEqual(new Error('The request should be Protocol buffer'))
//     }
//   })
//   // -----------------------------------------------------------------------------
//   it('should return the predictReminding', async () => {
//     const postBody = varProto.request.transform(predictData)
//     const expectMockValue = Protos.Reminding.response.encode(mockReturnValue).toBuffer()
//     const genThis = function () {
//       return {
//         models: {
//           getRemindings: jest.fn(
//             function* getRemindings() {
//               return mockReturnValue
//             }
//           ),
//         },
//         params: {
//           c_id: 1,
//           m_id: 1
//         },
//         req:postBody,
//         is : jest.fn(
//           function* is(contentType) {
//             if (!contentType) return typeis(this.req)
//             if (!Array.isArray(contentType)) contentType = [].slice.call(arguments)
//             return typeis(this.req, contentType)
//           }
//         ),
//       }
//     }
//
//     const Mock = jest.fn().mockImplementation(genThis)
//     const mock = new Mock()
//     await co(categoriesObj.fetchRemindings.apply(mock))
//     expect(mock.body).toEqual(expectMockValue)
//     expect(mock.type).toEqual(expectType)
//   })
//
//   // -----------------------------------------------------------------------------
//   it('should import Risks models when this.modules does not exist.', async () => {
//     const postBody = varProto.request.transform(predictData)
//     const genThis = function () {
//       return {
//         params: {
//           c_id: 1,
//           m_id: 1
//         },
//         req:postBody,
//         is : jest.fn(
//           function* is(contentType) {
//             if (!contentType) return typeis(this.req)
//             if (!Array.isArray(contentType)) contentType = [].slice.call(arguments)
//             return typeis(this.req, contentType)
//           }
//         )
//       }
//     }
//     const successHandler = function() {
//
//     }
//     const errorHnadler = function(err) {
//       // console.warn(err)
//     }
//     co(categoriesObj.fetchRemindings.apply(genThis())).then(successHandler, errorHnadler)
//   })
// })

describe('[unit] The fetchAccess function in the Categories modules', function() {
  const mockReturnValue = true
  const categoriesObj = new Categories()
  it('should call the getAccess with specific arguments', async () => {

    const genThis = function () {
      return {
        models: {
          getAccess: jest.fn(
            function* getAccess() {
              return mockReturnValue
            }
          ),
        },
        params: {
          c_id: 1,
          m_id: 1
        },
        query: {
          time: 1,
          p_id: 'p_id',
          r_id: 'r_id'
        }
      }
    }
    const Mock = jest.fn().mockImplementation(genThis)
    const mock = new Mock()
    await co(categoriesObj.fetchAccess.apply(mock))
    expect(mock.models.getAccess.mock.calls[0])
      .toEqual([1, 1, 1, 'p_id', 'r_id'])
  })

  // -----------------------------------------------------------------------------
  it('status should be 204', async () => {
    const genThis = function () {
      return {
        models: {
          getAccess: jest.fn(
            function* getAccess() {
              return mockReturnValue
            }
          ),
        },
        params: {
          c_id: 1,
          m_id: 1
        },
        query: {
          time: 1,
          p_id: 'p_id',
          r_id: 'r_id',
        },
      }
    }

    const Mock = jest.fn().mockImplementation(genThis)
    const mock = new Mock()
    await co(categoriesObj.fetchAccess.apply(mock))
    expect(mock.status).toEqual(204)
  })

  // -----------------------------------------------------------------------------
  it('should import Risks models when this.modules does not exist.', async () => {

    const genThis = function () {
      return {
        params: {
          c_id: 1,
          m_id: 1,
        },
        query: {
          time: 1,
          p_id: 'p_id',
          r_id: 'r_id',
        },
      }
    }
    const successHandler = function() {

    }
    const errorHnadler = function(err) {
      console.warn(err)
    }
    co(categoriesObj.fetchAccess.apply(genThis())).then(successHandler, errorHnadler)
  })
})
