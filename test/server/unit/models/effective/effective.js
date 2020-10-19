import Effective, { effectiveFunc } from 'server/models/maya/effective/effective'
import moment from 'moment'
import co from 'co'

const yearList = {
  rows: [{
    year: '2017',
  }, {
    year: '2016',
  }],
}
const config = {
  maxblood_upper : 140,
  maxblood_lower : 100,
  maxblood_upper_tuning_value : 30,
  maxblood_upper_tuning_unit: 'mmhg',
  maxblood_middle_tuning_value : 15,
  maxblood_middle_tuning_unit : '%',
  maxblood_lower_tuning_value : 10,
  maxblood_lower_tuning_unit : '%',
  conductivity_threshold: 0.2,
  dialysate_temp_threshold: -0.5,
  urf_threshold: -0.2,
  blood_flow_threshold: -30,
  lang: 'en',
}
describe('[unit] The getPDF function in the Effective models', function() {
  let parametObject = {
    reportDate: moment(Date.now().valueOf()).format('YYYY-MM-DD'),
    startDate: '2017-09-18',
    endDate: '2017-10-25',
    SBPDrop: [
      [],
      [],
      [],
    ],
    ProcessRate: [],
    AlarmThreat: [
      [],
      [],
    ],
    ...config,
  }
  it('year: 2017, run getPDF function & other mock function', async () => {

    const tempParame = {
      models: {
        'getReportValues': function* (year, lang) {
          return parametObject
        },
        'getPromisePdf': function(arrayObject){
          return arrayObject
        },
      },
    }
    co(
      Effective.getPDF.apply(tempParame, ['2017', 'en'])
    ).then(
      function(res) {
        expect(res).toMatchObject(parametObject)
      }
    )
  })

  it('should import getReportValues when this.modules does not exist', async () => {
    const tempParame = {
      models: {
        'systemDB': {
          Query: function* (queryCode, paramet) {
            if(queryCode == `SELECT min(startdate) as startdate, max(enddate) as enddate FROM webportal.sbp_drop WHERE year = '2017'`){
              return {
                rows: [{
                  startdate: '2017-09-18',
                  enddate: '2017-10-25' }],
              }
            } else {
              return {
                rows: [],
              }
            }
          },
        },
        'getPromisePdf': function(arrayObject){
          return arrayObject
        },
      },
    }
    co(
      Effective.getPDF.apply(tempParame, ['2017', 'en'])
    ).then(
      function(res) {
        expect(typeof res).toBe('object')
      }
    )
  })

  it('should import getPromisePdf when this.modules does not exist', async () => {
    const tempParame = {
      models: {
        'getReportValues': function* (year) {
          return parametObject
        },
      },
    }
    co(
      await Effective.getPDF.apply(tempParame, ['2017', 'en'])
    ).then(
      function(res) {
        expect(typeof res).toBe('object')
      }
    )
  })
})

describe('[unit] The getList function in the Effective models', function() {

  it('get year from mock DB for effective report options', async () => {
    const tempParame = {
      models: {
        'systemDB': {
          Query: function* (queryCode, paramet) {
            return yearList
          },
        },
      },
    }
    co(
      Effective.getList.apply(tempParame)
    ).then(
      function(res) {
        expect(res).toMatchObject(['2017', '2016'])
      }
    )
  })

  it('get empty year from mock DB for effective report options', async () => {
    const tempParame = {
      models: {
        'systemDB': {
          Query: function* (queryCode, paramet) {
            return { rows: [] }
          },
        },
      },
    }
    co(
      Effective.getList.apply(tempParame)
    ).then(
      function(res) {
        expect(res).toMatchObject([])
      }
    )
  })

  it('should import systemDB models when this.modules does not exist, get DB value', async () => {
    co(
      Effective.getList()
    ).then(
      function(res) {
        expect(typeof res).toBe('object')
      }
    )
  })
})

describe('[unit] The getReportValues function in the Effective models', function() {
  let returnObject =  {
    reportDate: moment(Date.now().valueOf()).format('YYYY-MM-DD'),
    startDate: '2017-09-18',
    endDate: '2017-10-25',
    SBPDrop: [
      [null, null, null, null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null, null, null],
    ],
    ProcessRate: [null, null, null, null, null, null, null, null, null, null, null, null, null],
    AlarmThreat: [
      [null, null, null, null, null, null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null, null, null, null, null, null],
    ],
    ...config,
  }

  it('year: 2017, lang: zh-tw, Query row is null', async () => {
    const tempParame = {
      models: {
        'systemDB': {
          Query: function* (queryCode, paramet) {
            if(queryCode == `SELECT min(startdate) as startdate, max(enddate) as enddate FROM webportal.sbp_drop WHERE year = '2017'`){
              return {
                rows: [{
                  startdate: '2017-09-18',
                  enddate: '2017-10-25' }],
              }
            } else {
              return {
                rows: [],
              }
            }
          },
        },
      },
    }

    co(
      effectiveFunc.getReportValues.apply(tempParame, ['2017', 'en'])
    ).then(
      function(res) {
        expect(res).toMatchObject(returnObject)
      }
    )
  })

  it('year: 2017, lang: zh-tw, Query row is null , get start & end date from table process_rate', async () => {
    const tempParame = {
      models: {
        'systemDB': {
          Query: function* (queryCode, paramet) {
            if(queryCode == `SELECT min(startdate) as startdate, max(enddate) as enddate FROM webportal.process_rate WHERE year = '2017'`){
              return {
                rows: [{
                  startdate: '2017-09-18',
                  enddate: '2017-10-25' }],
              }
            } else {
              return {
                rows: [],
              }
            }
          },
        },
      },
    }
    co(
      effectiveFunc.getReportValues.apply(tempParame, ['2017', 'en'])
    ).then(
      function(res) {
        expect(res).toMatchObject(returnObject)
      }
    )
  })

  it('year: 2017, lang: zh-tw, table rows is not null', async () => {
    let returnObject =  {
      reportDate: moment(Date.now().valueOf()).format('YYYY-MM-DD'),
      startDate: '2017-09-18',
      endDate: '2017-10-25',
      SBPDrop: [
        [11, null, null, null, null, null, null, null, null, 22, 33, null, null],
        [22, null, null, null, null, null, null, null, null, 33, 11, null, null],
        [33, null, null, null, null, null, null, null, null, 11, 22, null, null],
      ],
      ProcessRate: [11, null, null, null, null, null, null, null, null, 22, 33, null, null],
      AlarmThreat: [
        [11, null, null, null, null, null, null, null, null, 22, 33, null, null],
        [22, null, null, null, null, null, null, null, null, 33, 11, null, null],
      ],
      ...config,
    }
    const tempParame = {
      models: {
        'systemDB': {
          Query: function* (queryCode, paramet) {
            if(queryCode == `SELECT min(startdate) as startdate, max(enddate) as enddate FROM webportal.sbp_drop WHERE year = '2017'`){
              return {
                rows: [{
                  startdate: '2017-09-18',
                  enddate: '2017-10-25' }],
              }
            } else if (queryCode == `SELECT month, process_rate FROM webportal.process_rate WHERE year = '2017'`) {
              return {
                rows: [{
                  month: '00',
                  process_rate: 11,
                }, {
                  month: '09',
                  process_rate: 22,
                }, {
                  month: '10',
                  process_rate: 33,
                }],
              }
            } else if (queryCode == `SELECT month, number, bpropevent_num, bpdrop_rate FROM webportal.sbp_drop WHERE year = '2017'`) {
              return {
                rows: [{
                  month: '00',
                  number: 11,
                  bpropevent_num: 22,
                  bpdrop_rate: 33,
                }, {
                  month: '09',
                  number: 22,
                  bpropevent_num: 33,
                  bpdrop_rate: 11,
                }, {
                  month: '10',
                  number: 33,
                  bpropevent_num: 11,
                  bpdrop_rate: 22,
                }],
              }
            } else {
              return {
                rows: [{
                  month: '00',
                  treat: 11,
                  nontreat: 22,
                }, {
                  month: '09',
                  treat: 22,
                  nontreat: 33,
                }, {
                  month: '10',
                  treat: 33,
                  nontreat: 11,
                }],
              }
            }
          },
        },
      },
    }
    co(
      effectiveFunc.getReportValues.apply(tempParame, ['2017', 'en'])
    ).then(
      function(res) {
        expect(res).toMatchObject(returnObject)
      }
    )
  })

  it('should import systemDB models when this.modules does not exist, year: 2017', async () => {
    co(
      effectiveFunc.getReportValues('2017', 'en')
    ).then(
      function(res) {
        expect(typeof res).toBe('object')
      }
    )
  })
})

describe('[unit] The getPromisePdf function in the Effective models', function() {
  let parametObject =  {
      reportDate: moment(Date.now().valueOf()).format('YYYY-MM-DD'),
      startDate: '2017-09-18',
      endDate: '2017-10-25',
      SBPDrop: [
        [11, null, null, null, null, null, null, null, null, 22, 33, null, null],
        [22, null, null, null, null, null, null, null, null, 33, 11, null, null],
        [33, null, null, null, null, null, null, null, null, 11, 22, null, null],
      ],
      ProcessRate: [11, null, null, null, null, null, null, null, null, 22, 33, null, null],
      AlarmThreat: [
        [11, null, null, null, null, null, null, null, null, 22, 33, null, null],
        [22, null, null, null, null, null, null, null, null, 33, 11, null, null],
      ],
      ...config,
    }

  it('should import pdf when models does not exist, getHtml function return a Butter', async () => {
    const genThis = function () {
      return {
        'params':{},
      }
    }

    co(effectiveFunc.getPromisePdf.apply(genThis(), [parametObject])).then(successHandler, errorHnadler)
  })

  it('pdf is a mock & toStream error, return a reject Promise', async () => {

    const tempParame = {
      models: {
        'pdf': {
          'create': function(abc){
            return  {
              'toStream': function(arrow){
                return arrow('error string', '')
              },
            }
          },
        },
        'getHtml': function(array){
          return `<html></html>`
        },
      },
    }
    co(
      effectiveFunc.getPromisePdf.apply(tempParame, [parametObject])
    ).then(
      function(res) {
      },
      function(err){
        expect(err).toBe('error string')
      }
    )
  })

  it('pdf is a mock & stream.on, return a reject Promise', async () => {

    const tempParame = {
      models: {
        'pdf': {
          'create': function(abc){
            return  {
              'toStream': function(arrow){
                return arrow('', {
                  pipe: function(){
                    return true
                  },
                  on: function(paramet, errFunc){
                    if(paramet == 'error')
                      return errFunc('error string')
                    else
                      return true
                  },
                })
              },
            }
          },
        },
        'getHtml': function(array){
          return `<html></html>`
        },
      },
    }
    co(
      effectiveFunc.getPromisePdf.apply(tempParame, [parametObject])
    ).then(
      function(res) {
      },
      function(err){
        expect(err).toMatchObject({ 'code': 1041, 'message': 'error string' })
      }
    )
  })

  it('pdf is a mock & fs error, return a reject Promise', async () => {

    const tempParame = {
      models: {
        'pdf': {
          'create': function(abc){
            return  {
              'toStream': function(arrow){
                return arrow('', {
                  pipe: function(){
                    return true
                  },
                  on: function(paramet, errFunc){
                    if(paramet == 'error')
                      return true
                    else
                      return errFunc()
                  },
                })
              },
            }
          },
        },
        reportPDFPath: 'mockPath',
        'getHtml': function(array){
          return `<html></html>`
        },
      },
    }
    co(
      effectiveFunc.getPromisePdf.apply(tempParame, [parametObject])
    ).then(successHandler, errorHnadler)
  })
  it('pdf is a mock & toStream error, return a reject Promise', async () => {

    const tempParame = {
      models: {
        'pdf': {
          'create': function(abc){
            return  {
              'toStream': function(arrow){
                return arrow('', {
                  pipe: function(){
                    return true
                  },
                  on: function(paramet, errFunc){
                    if(paramet == 'error')
                      return true
                    else
                      return errFunc()
                  },
                })
              },
            }
          },
        },
        reportPDFPath: '/mockPath.html',
        fs: {
          'readFile': function(path, func){
            return func('error', 'data')
          },
        },
        'getHtml': function(array){
          return `<html></html>`
        },
      },
    }
    co(
      effectiveFunc.getPromisePdf.apply(tempParame, [parametObject])
    ).then(successHandler, errorHnadler)
  })

  it('pdf is a mock & toStream, return a resolve Promise', async () => {

    const tempParame = {
      models: {
        'pdf': {
          'create': function(abc){
            return  {
              'toStream': function(arrow){
                return arrow('', {
                  pipe: function(){
                    return true
                  },
                  on: function(paramet, errFunc){
                    if(paramet == 'error')
                      return true
                    else
                      return errFunc()
                  },
                })
              },
            }
          },
        },
        reportPDFPath: '/mockPath.html',
        fs: {
          'readFile': function(path, func){
            return func(null, 'data')
          },
        },
        'getHtml': function(array){
          return `<html></html>`
        },
      },
    }
    co(
      effectiveFunc.getPromisePdf.apply(tempParame, [parametObject])
    ).then(successHandler, errorHnadler)
  })
})

const successHandler = function() {
}
const errorHnadler = function(err) {
  console.warn(err)
}
