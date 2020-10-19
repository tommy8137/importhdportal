import Sbp from 'server/api/maya/alarm/sbp.js'
import co from 'co'
import Protos from 'common/protos'
import { errorCode } from 'server/helpers/api-error-helper'

const { SbpVar: sbpProto } = Protos
const typeis = require('type-is')

describe('Settings api & update function', async() => {
  let parameters = this
  const sbpFunc = new Sbp()
  // it('[unit] request type is not application/octet-stream,  it should be return "The request should be Protocol buffer"', async () => {
  //   let tempParamet = {
  //     ...parameters,
  //     'request': {
  //       'type': 'application/octet-stream',
  //     },
  //     'state':{
  //       'user':{
  //         'id':'mis',
  //       },
  //     },
  //     'is': function(){ return false},
  //     'throw': function(state, errorString){ return errorString },
  //   }
  //   try {
  //     await co(sbpFunc.updateSbp.apply(tempParamet))
  //   } catch (err) {
  //     expect(err.message).toEqual('The request should be Protocol buffer')
  //   }
  // })
  // -----------------------------------------------------------------------------
  // it('[unit] request data is empty, it should be return "request data should be provided")', async () => {
  //   const body = {
  //   }
  //   const postBody = sbpProto.request.transform(body)

  //   let tempParamet = {
  //     ...parameters,
  //     request: {
  //       type: 'application/octet-stream',
  //     },
  //     state:{
  //       user:{
  //         id:'mis',
  //       },
  //     },
  //     is : jest.fn(
  //       function* is(contentType) {
  //         if (!contentType) return typeis(this.req)
  //         if (!Array.isArray(contentType)) contentType = [].slice.call(arguments)
  //         return typeis(this.req, contentType)
  //       }
  //     ),
  //     req: postBody,
  //   }

  //   try {
  //     await co(sbpFunc.updateSbp.apply(tempParamet))
  //   } catch (err) {
  //     const expectError = new Error('request data should be provided')
  //     expectError.code = errorCode.REQUEST_DATA_EMPTY
  //     expect(err).toEqual(expectError)
  //   }
  // })
  // -----------------------------------------------------------------------------
  // it('[unit] should call the updateSbs with specific arguments', async () => {
  //   const body = {
  //     'hdrec_id': '01D553E2EDF289D5CC528478EA5D4899',
  //     'sbp_time': '2017-10-21 16:21:27',
  //     'ev_status': 2,
  //     'ev_situation': '透析過程順利無不適2222。',
  //     'ev_process': '雙重核對醫囑，透析機面板設定皆正確。',
  //     'ev_time': '2017-08-29 16:40',
  //   }
  //   const postBody = sbpProto.request.transform(body)
  //   let tempParamet = {
  //     ...parameters,
  //     request: {
  //       type: 'application/octet-stream',
  //     },
  //     state:{
  //       user:{
  //         id:'mis',
  //       },
  //     },
  //     is : jest.fn(
  //       function* is(contentType) {
  //         if (!contentType) return typeis(this.req)
  //         if (!Array.isArray(contentType)) contentType = [].slice.call(arguments)
  //         return typeis(this.req, contentType)
  //       }
  //     ),
  //     req: postBody,
  //     models:{
  //       updateSbpStatus: jest.fn(
  //         function* updateSbpStatus() {
  //           return true
  //         }
  //       ),
  //     },
  //   }

  //   const genThis = function () {
  //     return tempParamet
  //   }
  //   const Mock = jest.fn().mockImplementation(genThis)
  //   const mock = new Mock()
  //   const result = await co(sbpFunc.updateSbp.apply(mock))
  //   expect(mock.status).toEqual(204)
  // })


  // -----------------------------------------------------------------------------
  it('[unit] should import Sbp models when this.modules does not exist.', async () => {
    const body = {
      'hdrec_id': '01D553E2EDF289D5CC528478EA5D4899',
      'sbp_time': '2017-10-21 16:21:27',
      'ev_status': 2,
      'ev_situation': '透析過程順利無不適2222。',
      'ev_process': '雙重核對醫囑，透析機面板設定皆正確。',
      'ev_time': '2017-08-29 16:40',
    }
    const postBody = sbpProto.request.transform(body)
    let tempParamet = {
      ...parameters,
      request: {
        type: 'application/octet-stream',
      },
      state:{
        user:{
          id:'mis',
        },
      },
      is : jest.fn(
        function* is(contentType) {
          if (!contentType) return typeis(this.req)
          if (!Array.isArray(contentType)) contentType = [].slice.call(arguments)
          return typeis(this.req, contentType)
        }
      ),
      req: postBody,
    }
    const genThis = function () {
      return tempParamet
    }
    co(sbpFunc.updateSbp.apply(genThis())).then(successHandler, errorHnadler)
  })

})
const successHandler = function() {

}
const errorHnadler = function(err) {
}
