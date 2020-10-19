import Protos from 'common/protos'
import co from 'co'
import Patients from 'server/api/maya/searches/patients.js'
import moment from 'moment'

describe('[unit] The fetchPatient function in the Patients modules', function() {
  const mockReturnValue = {
    'name': 'name',
    'patient_id': '<p_id>',
    'bed_no': '<bed_no>',
    'age': 1,
    'gender':  'F|M',
    'diseases':[
      {
        'd_id': 'd_id1',
        'd_name': '<d_name1>',
      },
      {
        'd_id': '<d_id2>',
        'd_name': '<d_name2>',
      },
    ],
  }
  const shiftsBuffer = Protos.Patient.response.encode(mockReturnValue).toBuffer()
  const expectType = 'application/octet-stream'
  const patientsObj = new Patients()
  // -----------------------------------------------------------------------------
  it('should call the getPatients with specific arguments', async () => {
    const genThis = function () {
      return {
        models: {
          getPatients: jest.fn(
            function* getPatients() {
              return mockReturnValue
            }
          ),
        },
        params: {
          p_id: 'p_id',
        },
      }
    }
    const Mock = jest.fn().mockImplementation(genThis)
    const mock = new Mock()
    await co(patientsObj.fetchPatient.apply(mock))
    expect(mock.models.getPatients.mock.calls[0])
      .toEqual(['p_id'])
  })
  // -----------------------------------------------------------------------------
  it('should return the patients', async () => {
    const genThis = function () {
      return {
        models: {
          getPatients: jest.fn(
            function* getPatients() {
              return mockReturnValue
            }
          ),
        },
        params: {
          p_id: 'p_id',
        },
      }
    }
    const Mock = jest.fn().mockImplementation(genThis)
    const mock = new Mock()
    await co(patientsObj.fetchPatient.apply(mock))
    expect(mock.body).toEqual(shiftsBuffer)
    expect(mock.type).toEqual(expectType)
  })
  // -----------------------------------------------------------------------------
  it('should import Patient models when this.modules does not exist.', async () => {
    const genThis = function () {
      return {
        params: {
          p_id: 'p_id',
        },
      }
    }
    co(patientsObj.fetchPatient.apply(genThis())).then( successHandler, errorHnadler)
  })
})

describe('[unit] The fetchDashboard function in the Patients modules', function() {
  const mockReturnValue =  {
    'status_hightlight':
    {
      'weight':
      {
        'pre': 1.0,
        'post': 1.0,
      },
      'sbp':
      {
        'pre': 1,
        'post': 1,
      },
      'dbp':
      {
        'pre': 1,
        'post': 1,
      },
      'heparin_usage_status':
      {
        'start': 1,
        'remain': 1,
        'circulation': 1,
      },
    },
    'dialyze_records':
    {
      'r_id': '<r_id>',
      'total': 1,
      'abnormal':
      [
        {
          'symptom': '<symptom>',
          'pi_id': '<pi_id>',
        },
      ],
      'handled':
      [
        {
          'symptom': '<symptom>',
          'treatment': '<treatment>',
          'pi_id': '<pi_id>',
        },
      ],
    },
    'dialysis_test_result':
    {
      'tr_id': '<tr_id>',
      'date': '<yyyy-mm-dd>',
      'total': 1,
      'abnormal':
      [
        {
          'name': '<name>',
          'value': '<value>',
          'ti_id': '<ti_id>',
        },
      ],
    },
  }
  const shiftsBuffer = Protos.Dashboard.response.encode(mockReturnValue).toBuffer()
  const expectType = 'application/octet-stream'
  const patientsObj = new Patients()
  // -----------------------------------------------------------------------------
  // it('should call the getDashboards with specific arguments', async () => {
  //   const genThis = function () {
  //     return {
  //       models: {
  //         getDashboards: jest.fn(
  //           function* getDashboards() {
  //             return mockReturnValue
  //           }
  //         ),
  //       },
  //       params: {
  //         p_id: 'p_id',
  //         r_id: 'r_id',
  //       },
  //     }
  //   }
  //   const Mock = jest.fn().mockImplementation(genThis)
  //   const mock = new Mock()
  //   await co(patientsObj.fetchDashboard.apply(mock))
  //   expect(mock.models.getDashboards.mock.calls[0])
  //     .toEqual(['p_id', 'r_id'])
  // })

  // -----------------------------------------------------------------------------
  // it('should return the dashboards', async () => {
  //   const genThis = function () {
  //     return {
  //       models: {
  //         getDashboards: jest.fn(
  //           function* getDashboards() {
  //             return mockReturnValue
  //           }
  //         ),
  //       },
  //       params: {
  //         p_id: 'p_id',
  //         r_id: 'r_id',
  //       },
  //     }
  //   }

  //   const Mock = jest.fn().mockImplementation(genThis)
  //   const mock = new Mock()
  //   await co(patientsObj.fetchDashboard.apply(mock))
  //   expect(mock.body).toEqual(shiftsBuffer)
  //   expect(mock.type).toEqual(expectType)
  // })

  // -----------------------------------------------------------------------------
  it('should import Dashboards models when this.modules does not exist.', async () => {
    const genThis = function () {
      return {
        params: {
          p_id: '16209756',
          'r_id': '0008CD7411ECAC9ABBEB79C4918A864F',
        },
      }
    }
    co(patientsObj.fetchDashboard.apply(genThis())).then( successHandler, errorHnadler)
  })
})

describe('[unit] The listRecord function in the Patients modules', function() {
  const mockReturnValue =  {
    'total_nums': 1,
    'records':[
      {
        'r_id': '<r_id>',
        'date': '<yyyy-mm-dd>',
        'tr_id': '<tr_id>',
      },
    ],
  }
  const shiftsBuffer = Protos.RecordList.response.encode(mockReturnValue).toBuffer()
  const expectType = 'application/octet-stream'
  const patientsObj = new Patients()

  // -----------------------------------------------------------------------------
  // Test cases
  // -----------------------------------------------------------------------------
  it('should call the getRecords with specific arguments', async () => {
    const day = moment().format('YYYY-MM-DD')
    const genThis = function () {
      return {
        models: {
          getRecords: jest.fn(
            function* getRecords() {
              return mockReturnValue
            }
          ),
        },
        query: {
          start_date: day,
          end_date: day,
          offset: 1,
          limit: 20,
        },
        params: {
          p_id: 'p_id',
        },
      }
    }
    const Mock = jest.fn().mockImplementation(genThis)
    const mock = new Mock()
    await co(patientsObj.listRecord.apply(mock))
    expect(mock.models.getRecords.mock.calls[0])
      .toEqual(['p_id', day, day, 1, 20])
  })

  // -----------------------------------------------------------------------------
  it('should return the records', async () => {
    const day = moment().format('YYYY-MM-DD')
    const genThis = function () {
      return {
        models: {
          getRecords: jest.fn(
            function* getRecords() {
              return mockReturnValue
            }
          ),
        },
        query: {
          start_date: day,
          end_date: day,
          offset: 1,
          limit: 20,
        },
        params: {
          p_id: 'p_id',
        },
      }
    }
    const Mock = jest.fn().mockImplementation(genThis)
    const mock = new Mock()
    await co(patientsObj.listRecord.apply(mock))
    expect(mock.body).toEqual(shiftsBuffer)
    expect(mock.type).toEqual(expectType)
  })
  // -----------------------------------------------------------------------------
  it('should import Records models when this.modules does not exist.', async () => {
    const day = moment().format('YYYY-MM-DD')
    const genThis = function () {
      return {
        query: {
          start_date: day,
          end_date: day,
          offset: 1,
          limit: 20,
        },
        params: {
          p_id: 'p_id',
        },
      }
    }
    co(patientsObj.listRecord.apply(genThis())).then( successHandler, errorHnadler)
  })
})

describe('[unit] The fetchRecord function in the Patients modules', function() {
  // -----------------------------------------------------------------------------
  // Global variable
  // -----------------------------------------------------------------------------
  const mockReturnValue = {
    'r_id': '<r_id>',
    'times_of_dialyze': 1,
    'date': '<yyyy-mm-dd>',
    'start_time': 1,
    'end_time': 1,
    'dryweight': 1.0,
    'temperature': 1.0,
    'dialysateca1': 1.0,
    'status': 0,
    'items':
    [
      {
        'ri_id': '<ri_id>',
        'name': '<item_name>',
        'unit': '<item_unit>',
        'type': '<type>',
        'data':
        [
          {
            'time': 1,
            'value': 1.0,
            'status': 1,
          },
        ],
      },
    ],
    'panels':
    {
      'pre':
      [
        {
          'pi_id': '<pi_id>',
          'time': 1,
          'symptom': '<symptom>',
          'treatment':'<treatment>',
          'order': '<order>',
          'status': 0,
        },
      ],
      'intra':
      [
        {
          'pi_id': '<pi_id>',
          'time': 1,
          'symptom': '<symptom>',
          'treatment': '<treatment',
          'order': '<order>',
          'status': 0,
        },
      ],
      'post':
      [
        {
          'pi_id': '<pi_id>',
          'time': 1,
          'symptom': '<symptom>',
          'treatment': '<treatment>',
          'order': '<order>',
          'status': 0,
        },
      ],
    },
  }
  const shiftsBuffer = Protos.Record.response.encode(mockReturnValue).toBuffer()
  const expectType = 'application/octet-stream'
  const patientsObj = new Patients()
  // -----------------------------------------------------------------------------
  // it('should call the getRecord with specific arguments', async () => {
  //   const genThis = function () {
  //     return {
  //       models: {
  //         getRecord: jest.fn(
  //           function* getRecord() {
  //             return mockReturnValue
  //           }
  //         ),
  //       },
  //       params: {
  //         p_id: 'p_id',
  //         r_id: 'r_id',
  //       },
  //       query: {},
  //     }
  //   }
  //   const Mock = jest.fn().mockImplementation(genThis)
  //   const mock = new Mock()
  //   await co(patientsObj.fetchRecord.apply(mock))
  //   let undefine
  //   expect(mock.models.getRecord.mock.calls[0])
  //     .toEqual(['p_id', 'r_id', undefine])
  // })
  // -----------------------------------------------------------------------------
  it('should return the record', async () => {
    const genThis = function () {
      return {
        models: {
          getRecord: jest.fn(
            function* getRecord() {
              return mockReturnValue
            }
          ),
        },
        params: {
          p_id: 'p_id',
          r_id: 'r_id',
        },
        query: {},
      }
    }
    const Mock = jest.fn().mockImplementation(genThis)
    const mock = new Mock()
    await co(patientsObj.fetchRecord.apply(mock))
    expect(mock.body).toEqual(shiftsBuffer)
    expect(mock.type).toEqual(expectType)
  })
  // -----------------------------------------------------------------------------
  it('should import Records models when this.modules does not exist.', async () => {

    const genThis = function () {
      return {
        params: {
          p_id: '16209756',
          r_id: '0008CD7411ECAC9ABBEB79C4918A864F',
        },
      }
    }
    co(patientsObj.fetchRecord.apply(genThis())).then( successHandler, errorHnadler)
  })
})

describe('[unit] The listRisks function in the Patients modules', function() {
  // -----------------------------------------------------------------------------
  // Global variable
  // -----------------------------------------------------------------------------
  const mockReturnValue = {
    'risk_summary':[
      {
        'category': '<category>',
        'c_id': '<c_id>',
        'module':
        [
          {
            'm_id': '<m_id>',
            'm_name': '<m_name>',
          },
        ],
      },
    ],
  }
  const shiftsBuffer = Protos.RiskSummary.response.encode(mockReturnValue).toBuffer()
  const expectType = 'application/octet-stream'
  const patientsObj = new Patients()
  // -----------------------------------------------------------------------------
  it('should import Patient models when this.modules does not exist.', async () => {
    const genThis = function () {
      return {
        params: {
          p_id: 'p_id',
          r_id: 'r_id',
        },
      }
    }
    co(patientsObj.listRisks.apply(genThis())).then(successHandler, errorHnadler)
  })
  // -----------------------------------------------------------------------------
  it('should call the getRisks with specific arguments', async () => {
    const genThis = function () {
      return {
        models: {
          getRisks: jest.fn(
            function* getRisks() {
              return mockReturnValue
            }
          ),
        },
        params: {
          p_id: 'p_id',
          r_id: 'r_id',
        }
      }
    }
    const Mock = jest.fn().mockImplementation(genThis)
    const mock = new Mock()
    await co(patientsObj.listRisks.apply(mock))
    expect(mock.models.getRisks.mock.calls[0])
      .toEqual(['p_id', 'r_id'])
  })
  // -----------------------------------------------------------------------------
  it('should return the risks', async () => {
    const genThis = function () {
      return {
        models: {
          getRisks: jest.fn(
            function* getRisks() {
              return mockReturnValue
            }
          ),
        },
        params: {
          p_id: 'p_id',
          r_id: 'r_id',
        },
      }
    }
    const Mock = jest.fn().mockImplementation(genThis)
    const mock = new Mock()
    await co(patientsObj.listRisks.apply(mock))
    expect(mock.body).toEqual(shiftsBuffer)
    expect(mock.type).toEqual(expectType)
  })
  // -----------------------------------------------------------------------------
  it('should import Patient models when this.modules does not exist.', async () => {
    const genThis = function () {
      return {
        models: {
          getRisks: jest.fn(
            function* getRisks() {
              return mockReturnValue
            }
          ),
        },
        params: {
          p_id: '16209756',
          r_id: '0008CD7411ECAC9ABBEB79C4918A864F',
        },
      }
    }
    co(patientsObj.listRisks.apply(genThis())).then( successHandler, errorHnadler)
  })
})

describe('[unit] The fetchItem function in the Patients modules', function() {
  // -----------------------------------------------------------------------------
  // Global variable
  // -----------------------------------------------------------------------------
  const mockReturnValue = {
    'total_nums': 1,
    'results':
    [
      {
        'tr_id': '<tr_id>',
        'date': '<Date valueOf()>',
        'value': 1.0,
      },
    ],
  }

  const shiftsBuffer = Protos.Item.response.encode(mockReturnValue).toBuffer()
  const expectType = 'application/octet-stream'
  const patientsObj = new Patients()

  // -----------------------------------------------------------------------------
  // Test cases
  // -----------------------------------------------------------------------------
  it('should call the getTestItems with specific arguments', async () => {
    const day = moment().format('YYYY-MM-DD')
    const genThis = function () {
      return {
        models: {
          getTestItems: jest.fn(
            function* getTestItems() {
              return mockReturnValue
            }
          ),
        },
        params: {
          p_id: 'p_id',
          ti_id: 'ti_id',
        },
        query: {
          start_date: day,
          end_date: day,
          offset: 1,
          limit: 20,
        },
      }
    }
    const Mock = jest.fn().mockImplementation(genThis)
    const mock = new Mock()
    await co(patientsObj.fetchItem.apply(mock))
    expect(mock.models.getTestItems.mock.calls[0])
      .toEqual(['p_id', 'ti_id', day, day, 1, 20])
  })
  // -----------------------------------------------------------------------------
  it('should return the items', async () => {
    const day = moment().format('YYYY-MM-DD')
    const genThis = function () {
      return {
        models: {
          getTestItems: jest.fn(
            function* getTestItems() {
              return mockReturnValue
            }
          ),
        },
        params: {
          p_id: 'p_id',
          ti_id: 'ti_id',
        },
        query: {
          start_date: day,
          end_date: day,
          offset: 1,
          limit: 20,
        },
      }
    }

    const Mock = jest.fn().mockImplementation(genThis)
    const mock = new Mock()
    await co(patientsObj.fetchItem.apply(mock))
    expect(mock.body).toEqual(shiftsBuffer)
    expect(mock.type).toEqual(expectType)
  })
  // -----------------------------------------------------------------------------
  it('should import Tests models when this.modules does not exist.', async () => {
    const day = moment().format('YYYY-MM-DD')
    const genThis = function () {
      return {
        params: {
          p_id: '16209756',
          ti_id: 'FHEHB@Hb'
        },
        query: {
          start_date: day,
          end_date: day,
          offset: 0,
          limit: 20,
        },
      }
    }
    co(patientsObj.fetchItem.apply(genThis())).then( successHandler, errorHnadler)
  })
})

describe('[unit] The fetchResultList function in the Patients modules', function() {
  // -----------------------------------------------------------------------------
  // Global variable
  // -----------------------------------------------------------------------------
  const mockReturnValue =   {
    'total_nums': 1,
    'tests':
    [
      {
        'tr_id': '<tr_id>',
        'date': '<yyyy-mm-dd>',
      },
    ],
  }
  const shiftsBuffer = Protos.ResultList.response.encode(mockReturnValue).toBuffer()
  const expectType = 'application/octet-stream'
  const patientsObj = new Patients()
  // -----------------------------------------------------------------------------
  // Test cases
  // -----------------------------------------------------------------------------
  it('should call the getTestResults with specific arguments', async () => {
    const day = moment().format('YYYY-MM-DD')
    const genThis = function () {
      return {
        models: {
          getTestResults: jest.fn(
            function* getTestResults() {
              return mockReturnValue
            }
          ),
        },
        params: {
          p_id: 'p_id',
        },
        query: {
          start_date: day,
          end_date: day,
          offset: 1,
          limit: 20,
        },
      }
    }

    const Mock = jest.fn().mockImplementation(genThis)
    const mock = new Mock()

    await co(patientsObj.fetchResultList.apply(mock))
    expect(mock.models.getTestResults.mock.calls[0])
      .toEqual(['p_id', day, day, 1, 20])
  })
  // -----------------------------------------------------------------------------
  it('should return the resultList', async () => {
    const day = moment().format('YYYY-MM-DD')
    const genThis = function () {
      return {
        models: {
          getTestResults: jest.fn(
            function* getTestResults() {
              return mockReturnValue
            }
          ),
        },
        params: {
          p_id: 'p_id',
        },
        query: {
          start_date: day,
          end_date: day,
          offset: 1,
          limit: 20,
        },
      }
    }
    const Mock = jest.fn().mockImplementation(genThis)
    const mock = new Mock()
    await co(patientsObj.fetchResultList.apply(mock))
    expect(mock.body).toEqual(shiftsBuffer)
    expect(mock.type).toEqual(expectType)
  })
  // -----------------------------------------------------------------------------
  it('should import Tests models when this.modules does not exist.', async () => {
    const day = moment().format('YYYY-MM-DD')
    const genThis = function () {
      return {
        params: {
          p_id: '16209756',
        },
        query: {
          start_date: day,
          end_date: day,
          offset: 1,
          limit: 20,
        },
      }
    }
    co(patientsObj.fetchResultList.apply(genThis())).then( successHandler, errorHnadler)
  })
})

describe('[unit] The fetchResult function in the Patients modules', function() {
  // -----------------------------------------------------------------------------
  // Global variable
  // -----------------------------------------------------------------------------
  const mockReturnValue =   {
    'tr_id': '<tr_id>',
    'date': '<yyyy-mm-dd>',
    'results':
    [
      {
        'name': '<name>',
        'ti_id': '<ti_id>',
        'value': '<value>',
        'unit': '<unit>',
        'standard': '<standard>',
        'tendency': 0,
        'status':  1,
      },
    ],
  }
  const shiftsBuffer = Protos.Result.response.encode(mockReturnValue).toBuffer()
  const expectType = 'application/octet-stream'
  const patientsObj = new Patients()

  // -----------------------------------------------------------------------------
  // Test cases
  // -----------------------------------------------------------------------------
  it('should call the getTestResult with specific arguments', async () => {
    const genThis = function () {
      return {
        models: {
          getTestResult: jest.fn(
            function* getTestResult() {
              return mockReturnValue
            }
          ),
        },
        params: {
          p_id: 'p_id',
          tr_id: 'tr_id',
        },
      }
    }
    const Mock = jest.fn().mockImplementation(genThis)
    const mock = new Mock()
    await co(patientsObj.fetchResult.apply(mock))
    expect(mock.models.getTestResult.mock.calls[0])
      .toEqual(['p_id', 'tr_id'])
  })
  // -----------------------------------------------------------------------------
  it('should return the result', async () => {
    const genThis = function () {
      return {
        models: {
          getTestResult: jest.fn(
            function* getTestResult() {
              return mockReturnValue
            }
          ),
        },
        params: {
          p_id: 'p_id',
          tr_id: 'tr_id',
        },
      }
    }
    const Mock = jest.fn().mockImplementation(genThis)
    const mock = new Mock()
    await co(patientsObj.fetchResult.apply(mock))
    expect(mock.body).toEqual(shiftsBuffer)
    expect(mock.type).toEqual(expectType)
  })
  // -----------------------------------------------------------------------------
  it('should import Test models when this.modules does not exist.', async () => {
    const genThis = function () {
      return {
        params: {
          p_id: '16209756',
          tr_id: '16209756+20160615',
        },
      }
    }
    co(patientsObj.fetchResult.apply(genThis())).then( successHandler, errorHnadler)
  })
})

const successHandler = function() {

}
const errorHnadler = function(err) {
  // console.warn(err)
}
