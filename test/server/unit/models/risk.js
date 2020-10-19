import Protos from 'common/protos'
import co from 'co'
import Risk from 'server/risk.js'
import { systemDB, hospitalDB } from 'server/helpers/database'
import merge from 'merge'
import schedule from 'node-schedule'


beforeEach(async function() {
  await co(systemDB.Query(`TRUNCATE webportal.risk`))
})

afterAll(async function() {
  await co(systemDB.Query(`TRUNCATE webportal.risk`))
})

describe('[unit] The init in the Risk schedule models', function() {
  it('confirm have schedule', async () => {
    await co(Risk.init())
    const job = schedule.scheduledJobs['risk_module']
    expect(job != null).toBe(true)
  })
  // -----------------------------------------------------------------------------
  it('just coverage for task ', async () => {
    let tmpPara = {
      models : {
        processSystemRisk: function*() { return {} },
        processMayaAlarmSystem: function*() { return {} },
      }
    }
    await co(Risk.task.apply(tmpPara))
  })
  // -----------------------------------------------------------------------------
  it('confirm import module without this(in scheduleJob)', async () => {
    try {
      let tmpPara = {
        env : 'importtest',
      }
      await co(Risk.task.apply(tmpPara))
    } catch(e) {
      console.warn(e)
    }
  })

  it('just the catch case for task  ', async () => {
    const expectError = new Error('unit test expect error')
    let tmpPara = {
      models : {
        processSystemRisk: function*() { return {} },
        processMayaAlarmSystem: function*() { throw expectError },
      }
    }
    await co(Risk.task.apply(tmpPara))
  })
})

describe('[unit] The processSystemRisk in the Risk schedule models', function() {
  // not easy to find, please use webportl to find risk and use sql tools to fullfill ns ==''
  const hdrec_id = 'A286FC1B3A8886105B86C6EFDE51DE1A'
  const predictVarChart = {
    res_bp_variation : [
      {
        UB_UB : 80,
        UB : 150,
        LB : 100,
        LB_LB : 4.1,
      },
    ],
  }
  // const predictRiskProb = { res_bp_probability : [50, 80, 100, 40, 30, 70] }
  // const predictEstChart = {
  //   res_bp_estimation : [{
  //     Upper_bound : 30,
  //     Lower_bound : 10,
  //     Predict : 10,
  //   }],
  // }
  const chartVarData = Protos.BPVar.response.encode(predictVarChart).toBuffer()
  // const chartProbData = Protos.BPProb.response.encode(predictRiskProb).toBuffer()
  // const chartEstData = Protos.BPEstimation.response.encode(predictEstChart).toBuffer()
  beforeEach(async function() {
    // avoid some error
    await co(systemDB.Query('TRUNCATE webportal.risk'))
  })

  afterAll(async function() {
    // avoid some error
    await co(systemDB.Query('TRUNCATE webportal.risk'))
  })
  // -----------------------------------------------------------------------------
  it('confirm schedule flow with attendedList is empty', async () => {
    let parameter = getPara()
    let tmpPara = {
      ...parameter,
      models : merge(parameter.models, {
        hospitalDB : {
          Query : function*() {
            return { rows : [] }
          },
        },
      }),
    }
    await co(Risk.processSystemRisk.apply(tmpPara))
  })
  // -----------------------------------------------------------------------------
  it('confirm schedule flow with no record with cis data', async () => {
    let parameter = getPara()
    let tmpPara = {
      ...parameter,
      models : merge(parameter.models, {
        getPredictDataAndLastTime : () =>  { return  { lastTime : 0 } }
      })

    }
    await co(Risk.processSystemRisk.apply(tmpPara))
    const result = await co(systemDB.Query('SELECT * FROM webportal.risk WHERE ev_status >= 0'))
    expect(result.rows.length).toBe(0)
  })
  // -----------------------------------------------------------------------------
  // diffMinute >= 0 && diffMinute <= 150
  it('Just for coverage for the predict range condiction ', async () => {
    let parameter = getPara()
    let tmpPara = {
      ...parameter,
    }
    await co(Risk.processSystemRisk.apply(tmpPara))
    const result = await co(systemDB.Query('SELECT * FROM webportal.risk WHERE ev_status >= 0'))
    // because it's outdated risk
    expect(result.rows.length).toBe(0)
  })

  // -----------------------------------------------------------------------------
  it('confirm schedule flow with predictData is inValidate ', async () => {
    let parameter = getPara()
    let tmpPara = {
      env : 'unittest',
      ...parameter,
      models : merge(parameter.models, {
        isValidate: () => { return false }
      })
    }
    await co(Risk.processSystemRisk.apply(tmpPara))
    const result = await co(systemDB.Query('SELECT * FROM webportal.risk WHERE ev_status >= 0'))
    expect(result.rows.length).toBe(0)
  })

  // -----------------------------------------------------------------------------
  it('confirm schedule flow with incorrect validate mechanism which will throw expection', async () => {
    let parameter = getPara()
    let tmpPara = {
      env : 'unittest',
      ...parameter,
      models : merge(parameter.models, {
        checkVarRisk : () => { throw Error('Hi, this is unit test, Could you see me?') },
      })
    }

    await co(Risk.processSystemRisk.apply(tmpPara))
    const result = await co(systemDB.Query('SELECT * FROM webportal.risk WHERE ev_status >= 0'))
    expect(result.rows.length).toBe(0)
  })
  // -----------------------------------------------------------------------------
  it('confirm schedule flow with correct data', async () => {
    let parameter = getPara()
    let tmpPara = {
      env : 'unittest',
      ...parameter,
      models : merge(parameter.models, {
        checkVarRisk : () => { return { type: 'middle', risk_time:'11:22' } },
        // checkProbRisk : () => { return true },
        // checkEstRisk : () => { return true }
      })
    }
    // just for ns condition = '' beacause ues unittest db, so it's not necessary  to recovery.
    // select top 1 data_time from tyhd_cis_data where hdrec_id = 'A286FC1B3A8886105B86C6EFDE51DE1A'  and max_blood!= '' and time >= 1  order by data_time desc
    await co(hospitalDB.Query(`update tyhd_cis_data set ns = '' where data_time = '2017/07/04 21:10:55' and hdrec_id = 'A286FC1B3A8886105B86C6EFDE51DE1A'`))

    await co(Risk.processSystemRisk.apply(tmpPara))

    const result = await co(systemDB.Query(`SELECT * FROM webportal.risk  WHERE hemno = '${hdrec_id}' AND c_id = '1'
                                            ORDER BY m_id ASC`))
    expect(result.rows.length).toBe(1)
    for(let i = 0; i < result.rows.length; i++) {
      let expectID = i + 2
      expect(result.rows[i].m_id).toBe(expectID)
    }
    await co(systemDB.Query(`DELETE FROM webportal.risk WHERE  hemno = '${hdrec_id}'`))
  })

  function getPara() {
    let parameter = {
      models: {
        hospitalDB : {
          Query : function*() {
            return yield co(hospitalDB.Query(`SELECT record.pat_no, record.hdrec_id, record.bw_stand AS dryweight, record.hd_bt AS temperature,
                                                convert(datetime,pat.BIRTH_DATE,112) AS birth, pat.sex AS gender,pat.DISEASE_1, pat.DISEASE_2,
                                                pat.DISEASE_3, pat.DISEASE_4,pat.DISEASE_5, pat.DISEASE_6, pat.DISEASE_7, pat.DISEASE_8, pat.HEM_FIRST_DT
                                              FROM vi_TYHD_PAT_HD_MASTER AS record
                                              INNER JOIN TYHD_PAT_HD_BASE AS pat
                                                ON pat.pat_no = record.pat_no
                                              WHERE hdrec_id = '${hdrec_id}'`))
          },
        },
        checkVarRisk : () => { return { type: 'middle', risk_time:'11:22' } },
        getCharts: function*(predictData, categoryId, moduleId) {
          switch (moduleId) {
            case 2:
              return chartVarData
            // case 3:
            //   return chartProbData
            // case 4:
            //   return chartEstData
            default:
              throw Error('Please add unit test case')
          }
        },
        processSystemRisk : () => {},
      },
    }
    return parameter
  }

  // -----------------------------------------------------------------------------
  it('confirm import models where this.models is undefine', async () => {
    try {
      let tmpPara = {
        env : 'importtest',
      }
      await co(Risk.processSystemRisk.apply(tmpPara))
    } catch(e) {
      // console.warn('just for coverage' + e)
    }
  })
})
