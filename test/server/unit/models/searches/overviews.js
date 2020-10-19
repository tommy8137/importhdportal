import co from 'co'
import Overviews, { tuningMaxbloodLower } from 'server/models/maya/searches/overviews.js'
import Protos from 'common/protos'
import { systemDB, hospitalDB } from 'server/helpers/database'
import { isValidate } from 'common/modules/sbp/validator'
import moment from 'moment'
// -----------------------------------------------------------------------------
// Description : If db's data could cover models condition then without mock, and vice versa
//               Verify sql schema of models by using helpers/database
//               Checkout return results by Protos
// Note issue : the compare mechanism of sql template string is not good.
// -----------------------------------------------------------------------------
const record = {
  'items':[
    { ri_id:'blood_flow', 'name':'Blood Flow', 'unit':'ml/min', 'type':'text', 'data':[{ time:1496888840000, 'value':'hihihi', 'status':0 }] },
    { ri_id:'dia_flow', 'name':'Dialysate Flow', 'unit':'ml/min', 'type':'text', 'data':[{ time:1496888840000, 'value':'hihihi', 'status':0 }] },
    { ri_id:'pre_dia_temp_value', 'name':'Dialysate Temp.', 'unit':'°C', 'type':'text', 'data':[{ time:1496888840000, 'value':'hihihi', 'status':0 }] },
    { ri_id:'injection_vol', 'name':'Syringe Volume', 'unit':'u', 'type':'text', 'data':[] },
    { ri_id:'sbp', 'name':'SBP', 'unit':'mmHg', 'type':'chart', 'data':[{ time:1496888840000, 'value':150, 'status':0 }, { time:1496888880000, 'value':130, 'status':0 }] },
    { ri_id:'dbp', 'name':'DBP', 'unit':'mmHg', 'type':'chart', 'data':[{ time:1496888840000, 'value':38, 'status':0 }] },
    { ri_id:'venous', 'name':'VP', 'unit':'mmHg', 'type':'chart', 'data':[{ time:1496888840000, 'value':'hihihi', 'status':0 }] },
    { ri_id:'conductivity', 'name':'Conductivity', 'unit':'ms/cm', 'type':'chart', 'data':[{ time:1496888840000, 'value':14, 'status':0 }] },
    { ri_id:'tmp', 'name':'TMP', 'unit':'mmHg', 'type':'chart', 'data':[{ time:1496888840000, 'value':111, 'status':0 }] },
    { ri_id:'uf', 'name':'UFR', 'unit':'L/hr', 'type':'chart', 'data':[{ time:1496888840000, 'value':0.75, 'status':0 }] },
    { ri_id:'total_uf', 'name':'UF', 'unit':'kg', 'type':'chart', 'data':[{ time:1496888840000, 'value':0.028, 'status':0 }] },
    { ri_id:'pulse', 'name':'Pulse', 'unit':'beats/min', 'type':'chart', 'data':[{ time:1496888840000, 'value':70, 'status':0 }] },
    { ri_id:'deltadia_temp_value', name: 'Delta Dialysate Temp.', unit: '°C', type: 'text', data: [{ time:1496886169000, 'value':36, 'status':0 }] },
  ],
  temperature:null,
  dryweight:45,
  dialysis_year:1,
}
const patient = {
  'pat_no':'01559093',
  'hdrec_id':'29B1E9F15DF8442C70E35CE99C201706',
  'dryweight':'45',
  'temperature':'NA',
  'birth':'1939-11-28T00:00:00.000Z',
  'gender':'F',
  'DISEASE_1':'', 'DISEASE_2':'', 'DISEASE_3':'', 'DISEASE_4':'', 'DISEASE_5':'', 'DISEASE_6':'', 'DISEASE_7':'', 'DISEASE_8':'',
  'age':77,
  'diseases':[],
}

describe('[unit] The getOverviews function in the Overviews modules', function() {
  // -----------------------------------------------------------------------------
  it('Test call function without parameter ', async () => {
    const result = await co(Overviews.getOverviews())
    try {
      Protos.Overview.response.encode(result).toBuffer()
    } catch(e) {
      expect(e).toBe(result)
    }
  })
  // -----------------------------------------------------------------------------
  it('Test call function with parameter \'shift:all\'', async () => {
    const result = await co(Overviews.getOverviews('all'))
    try {
      Protos.Overview.response.encode(result).toBuffer()
    } catch(e) {
      expect(e).toBe(result)
    }
  })
  // -----------------------------------------------------------------------------
  it('Test call function with parameter \'shift:-1\'', async () => {
    const result = await co(Overviews.getOverviews(-1))
    try {
      Protos.Overview.response.encode(result).toBuffer()
    } catch(e) {
      expect(e).toBe(result)
    }
  })
  // -----------------------------------------------------------------------------
  it('Test all people cancel appointments with parameter "shift:whatever"', async () => {
    const result = await co(Overviews.getOverviews('whatever'))
    try {
      Protos.Overview.response.encode(result).toBuffer()
    } catch(e) {
      expect(e).toBe(result)
    }
  })

  // -----------------------------------------------------------------------------
  it('Test condition case - there are appointments which shift is 1', async () => {
    let result
    try {
      const day = moment().format('YYYY-MM-DD')
      const date = moment().format('YYYY-MM-DD hh:mm:ss')
      try {
        await co(hospitalDB.Query(`INSERT INTO TYHD_APPOINTMENT (app_seq, bed_no, app_priod, app_date, cancel_flag, pat_no)
                                    VALUES ('1', 'bed_no' , '1', '${day}', 'N' , 'unittest')`
                                 ))
        await co(hospitalDB.Query(`INSERT INTO TYHD_PAT_HD_MASTER (app_priod, hd_date, pat_no, hdrec_id)
                                  VALUES ('1', '${day}', 'unittest', 'hdrec_id')`
                                ))
        await co(systemDB.Query(`INSERT INTO webportal.risk (pno, hemno, c_id, type, sbp_time)
                                VALUES ('unittest', 'unittest', '1', 'upper', '${date}')`
                             ))
      } catch (e) {
        throw new Error('mock pg data for test error')
      }
      result = await co(Overviews.getOverviews(1))
      Protos.Overview.response.encode(result).toBuffer()
    } catch(e) {
      expect(e).toBe(result)
    } finally {
      await co(hospitalDB.Query(`DELETE FROM TYHD_APPOINTMENT
                                  WHERE pat_no = 'unittest'`
                               ))
      await co(hospitalDB.Query(`DELETE FROM TYHD_PAT_HD_MASTER
                                 WHERE pat_no = 'unittest'`
                               ))
      await co(systemDB.Query(`DELETE FROM webportal.risk
                                  WHERE pno = 'unittest'`
                               ))
    }
  })

  // -----------------------------------------------------------------------------
  it('Test call function with different shift and hemarea parameter for sql coverage', async () => {
    const result = await co(Overviews.getOverviews('all'))
    const result1 = await co(Overviews.getOverviews('all', '1'))
    const result2 = await co(Overviews.getOverviews('whatever'))
    const result3 = await co(Overviews.getOverviews('whatever', '1'))
    try {
      Protos.Overview.response.encode(result).toBuffer()
      Protos.Overview.response.encode(result1).toBuffer()
      Protos.Overview.response.encode(result2).toBuffer()
      Protos.Overview.response.encode(result3).toBuffer()
    } catch(e) {
      expect(e).toBe(result)
    }
  })
})

describe('[unit] The getAbnormals function in the Overviews modules', function() {
  // -----------------------------------------------------------------------------
  it('Test call function without parameter (default shift = \'all\') ', async () => {
    const result = await co(Overviews.getAbnormals())
    try {
      Protos.OverviewAbnormal.response.encode(result).toBuffer()
    } catch(e) {
      expect(e).toBe(result)
    }
  })

  // -----------------------------------------------------------------------------
  it('Test call function with parameter shift = \'1\', c_id = \' not_used_yet \' ', async () => {
    const result = await co(Overviews.getAbnormals(1, 'not_used_yet'))
    try {
      Protos.OverviewAbnormal.response.encode(result).toBuffer()
    } catch(e) {
      expect(e).toBe(result)
    }
  })

  // // -----------------------------------------------------------------------------
  it('Test call function with parameter shift = \'-1\'', async () => {
    const result = await co(Overviews.getAbnormals(-1))
    try {
      Protos.OverviewAbnormal.response.encode(result).toBuffer()
    } catch(e) {
      expect(e).toBe(result)
    }
  })

  // -----------------------------------------------------------------------------
  it('Test there are people which have categories of system risk table', async () => {
    try {
      const day = moment().format('YYYY-MM-DD')
      const date = moment().format('YYYY-MM-DD hh:mm:ss')

      try {
        await co(hospitalDB.Query(`INSERT INTO TYHD_APPOINTMENT (app_seq, bed_no, app_priod, app_date, cancel_flag, pat_no)
                                   VALUES ('1', 'bed_no' , '1', '${day}', 'N' , 'unittest')`
                                ))
        await co(hospitalDB.Query(`INSERT INTO TYHD_PAT_HD_BASE (pat_name_unicode, birth_date, sex, pat_no)
                                  VALUES ('9527', '20110302', 'M', 'unittest')`
                                ))
        await co(hospitalDB.Query(`INSERT INTO TYHD_PAT_HD_MASTER (app_priod, hd_date, pat_no, hdrec_id)
                                  VALUES ('1', '${day}', 'unittest', 'hdrec_id')`
                                ))
        await co(systemDB.Query(`INSERT INTO webportal.risk (pno, hemno, c_id, type, sbp_time, ev_status)
                                 VALUES ('unittest', 'unittest', '1', 'upper', '${date}', 0)`
                              ))
      } catch (e) {
        throw new Error('mock pg data for test error')
      }

      const result = await co(Overviews.getAbnormals('1', 'qq'))
      Protos.OverviewAbnormal.response.encode(result).toBuffer()
    } catch(e) {
      expect(e).toBe(false)
    } finally {
      await co(hospitalDB.Query(`DELETE FROM TYHD_APPOINTMENT
                                  WHERE pat_no = 'unittest'`
                               ))
      await co(hospitalDB.Query(`DELETE FROM TYHD_PAT_HD_BASE
                                  WHERE pat_no = 'unittest'`
                               ))
      await co(hospitalDB.Query(`DELETE FROM TYHD_PAT_HD_MASTER
                                  WHERE pat_no = 'unittest'`
                               ))
      await co(systemDB.Query(`DELETE FROM webportal.risk
                                  WHERE pno = 'unittest'`
                               ))
    }
  })

  // -----------------------------------------------------------------------------
  it('Test there are people which lack personal inforation(\'SEX,BIRTH\') and have categories of system risk table', async () => {
    try {
      const day = moment().format('YYYY-MM-DD')
      const date = moment().format('YYYY-MM-DD hh:mm:ss')
      try {
        await co(hospitalDB.Query(`INSERT INTO TYHD_APPOINTMENT (app_seq, bed_no, app_priod, app_date, cancel_flag, pat_no)
                                   VALUES ('1', 'bed_no' , '1', '${ day}', 'N' , 'unittest')`
                                ))
        await co(hospitalDB.Query(`INSERT INTO TYHD_PAT_HD_BASE (pat_name_unicode, birth_date, sex, pat_no)
                                  VALUES ('9527', NULL, NULL, 'unittest')`
                                ))
        await co(hospitalDB.Query(`INSERT INTO TYHD_PAT_HD_MASTER (app_priod, hd_date, pat_no, hdrec_id)
                                  VALUES ('1', '${day}', 'unittest', 'hdrec_id')`
                                ))
        await co(systemDB.Query(`INSERT INTO webportal.risk (pno, hemno, c_id, type, sbp_time, ev_status)
                                 VALUES ('unittest', 'unittest', '1', 'upper', '${date}', 0)`
                              ))
      } catch(e) {
        throw new Error('mock pg data for test error')
      }

      const result = await co(Overviews.getAbnormals('1', 'qq'))
      Protos.OverviewAbnormal.response.encode(result).toBuffer()
    } catch(e) {
      expect(e).toBe(false)
    } finally {
      await co(hospitalDB.Query(`DELETE FROM TYHD_APPOINTMENT
                                  WHERE pat_no = 'unittest'`
                               ))
      await co(hospitalDB.Query(`DELETE FROM TYHD_PAT_HD_BASE
                                  WHERE pat_no = 'unittest'`
                               ))
      await co(hospitalDB.Query(`DELETE FROM TYHD_PAT_HD_MASTER
                                  WHERE pat_no = 'unittest'`
                               ))
      await co(systemDB.Query(`DELETE FROM webportal.risk
                                  WHERE pno = 'unittest'`
                               ))
    }
  })

  // -----------------------------------------------------------------------------
  it('Test call function with different shift and hemarea parameter for sql coverage', async () => {
    const result = await co(Overviews.getAbnormals('all', 'whatever'))
    const result1 = await co(Overviews.getAbnormals('all', 'whatever', '1'))
    const result2 = await co(Overviews.getAbnormals('whatever', 'whatever'))
    const result3 = await co(Overviews.getAbnormals('whatever', 'whatever', '1'))
    try {
      Protos.OverviewAbnormal.response.encode(result).toBuffer()
      Protos.OverviewAbnormal.response.encode(result1).toBuffer()
      Protos.OverviewAbnormal.response.encode(result2).toBuffer()
      Protos.OverviewAbnormal.response.encode(result3).toBuffer()
    } catch(e) {
      expect(e).toBe(result)
    }
  })
})

describe('[unit] The getPredictDataAndLastTime function in the Overviews modules', function() {
  // -----------------------------------------------------------------------------
  // Global variable
  // use isValidate and Protos.BPVar to verify correct data.
  // -----------------------------------------------------------------------------

  it('Test call function with incorrect items which sbp data is empty', async () => {
    const record = {
      'items':[
        { ri_id:'blood_flow', 'name':'Blood Flow', 'unit':'ml/min', 'type':'text', 'data':[{ time:1496886169000, 'value':'hihihi', 'status':0 }] },
        { ri_id:'dia_flow', 'name':'Dialysate Flow', 'unit':'ml/min', 'type':'text', 'data':[{ time:1496886169000, 'value':492, 'status':0 }] },
        { ri_id:'pre_dia_temp_value', 'name':'Dialysate Temp.', 'unit':'°C', 'type':'text', 'data':[{ time:1496886169000, 'value':36, 'status':0 }] },
        { ri_id:'injection_vol', 'name':'Syringe Volume', 'unit':'u', 'type':'text', 'data':[] },
        { ri_id:'pulse', 'name':'Pulse', 'unit':'beats/min', 'type':'chart', 'data':[{ time:1496888840000, 'value':70, 'status':0 }] },
        { ri_id:'sbp', 'name':'SBP', 'unit':'mmHg', 'type':'chart', 'data':[] },
        { ri_id:'dbp', 'name':'DBP', 'unit':'mmHg', 'type':'chart', 'data':[{ time:1496888840000, 'value':38, 'status':0 }] },
        { ri_id:'venous', 'name':'VP', 'unit':'mmHg', 'type':'chart', 'data':[{ time:1496886169000, 'value':'hihihi', 'status':0 }] },
        { ri_id:'conductivity', 'name':'Conductivity', 'unit':'ms/cm', 'type':'chart', 'data':[{ time:1496886169000, 'value':14, 'status':0 }] },
        { ri_id:'tmp', 'name':'TMP', 'unit':'mmHg', 'type':'chart', 'data':[{ time:1496886169000, 'value':111, 'status':0 }] },
        { ri_id:'uf', 'name':'UFR', 'unit':'L/hr', 'type':'chart', 'data':[{ time:1496886169000, 'value':0.75, 'status':0 }] },
        { ri_id:'total_uf', 'name':'UF', 'unit':'kg', 'type':'chart', 'data':[{ time:1496886169000, 'value':0.028, 'status':0 }] },
        { ri_id:'pulse', 'name':'Pulse', 'unit':'beats/min', 'type':'chart', 'data':[{ time:1496888840000, 'value':70, 'status':0 }] },
        { ri_id:'deltadia_temp_value', name: 'Delta Dialysate Temp.', unit: '°C', type: 'text', data: [{ time:1496886169000, 'value':36, 'status':0 }] },
      ],
      temperature:null,
      dryweight:45,
      dialysis_year:1,
    }
    const patient = {
      'pat_no':'01559093',
      'hdrec_id':'29B1E9F15DF8442C70E35CE99C201706',
      'dryweight':'45',
      'temperature':'NA',
      'birth':'1939-11-28T00:00:00.000Z',
      'gender':'F',
      'DISEASE_1':'', 'DISEASE_2':'', 'DISEASE_3':'', 'DISEASE_4':'', 'DISEASE_5':'', 'DISEASE_6':'', 'DISEASE_7':'', 'DISEASE_8':'',
      'age':77,
      'diseases':[],
    }
    try {
      let { predictData } = await co(Overviews.getPredictDataAndLastTime(record, patient))
      if (isValidate(false, predictData) == true) {
        expect(predictData).toBe(true)
      }
    } catch(e) {
      expect(e).toBe(false)
    }
  })

  // -----------------------------------------------------------------------------
  it('Test call function with incorrect items which some item\'s value is string ', async () => {
    const record = {
      'items':[
        { ri_id:'blood_flow', 'name':'Blood Flow', 'unit':'ml/min', 'type':'text', 'data':[{ time:1496888840000, 'value':'hihihi', 'status':0 }] },
        { ri_id:'dia_flow', 'name':'Dialysate Flow', 'unit':'ml/min', 'type':'text', 'data':[{ time:1496888840000, 'value':'hihihi', 'status':0 }] },
        { ri_id:'pre_dia_temp_value', 'name':'Dialysate Temp.', 'unit':'°C', 'type':'text', 'data':[{ time:1496888840000, 'value':'hihihi', 'status':0 }] },
        { ri_id:'injection_vol', 'name':'Syringe Volume', 'unit':'u', 'type':'text', 'data':[] },
        { ri_id:'sbp', 'name':'SBP', 'unit':'mmHg', 'type':'chart', 'data':[{ time:1496888840000, 'value':null, 'status':0 }] },
        { ri_id:'dbp', 'name':'DBP', 'unit':'mmHg', 'type':'chart', 'data':[{ time:1496888840000, 'value':38, 'status':0 }] },
        { ri_id:'venous', 'name':'VP', 'unit':'mmHg', 'type':'chart', 'data':[{ time:1496888840000, 'value':'hihihi', 'status':0 }] },
        { ri_id:'conductivity', 'name':'Conductivity', 'unit':'ms/cm', 'type':'chart', 'data':[{ time:1496888840000, 'value':14, 'status':0 }] },
        { ri_id:'tmp', 'name':'TMP', 'unit':'mmHg', 'type':'chart', 'data':[{ time:1496888840000, 'value':111, 'status':0 }] },
        { ri_id:'uf', 'name':'UFR', 'unit':'L/hr', 'type':'chart', 'data':[{ time:1496888840000, 'value':0.75, 'status':0 }] },
        { ri_id:'total_uf', 'name':'UF', 'unit':'kg', 'type':'chart', 'data':[{ time:1496888840000, 'value':0.028, 'status':0 }] },
        { ri_id:'pulse', 'name':'Pulse', 'unit':'beats/min', 'type':'chart', 'data':[{ time:1496888840000, 'value':70, 'status':0 }] },
        { ri_id:'deltadia_temp_value', name: 'Delta Dialysate Temp.', unit: '°C', type: 'text', data: [{ time:1496886169000, 'value':36, 'status':0 }] },
      ],
      temperature:null,
      dryweight:45,
      dialysis_year:1,
    }
    const patient = {
      'pat_no':'01559093',
      'hdrec_id':'29B1E9F15DF8442C70E35CE99C201706',
      'dryweight':'45',
      'temperature':'NA',
      'birth':'1939-11-28T00:00:00.000Z',
      'gender':'F',
      'DISEASE_1':'', 'DISEASE_2':'', 'DISEASE_3':'', 'DISEASE_4':'', 'DISEASE_5':'', 'DISEASE_6':'', 'DISEASE_7':'', 'DISEASE_8':'',
      'age':77,
      'diseases':[],
    }
    try {
      let { predictData } = await co(Overviews.getPredictDataAndLastTime(record, patient))
      if (isValidate(false, predictData) == true) {
        expect(predictData).toBe(true)
      }
    } catch(e) {
      expect(e).toBe(false)
    }
  })

  it('Test call function with correct record', async () => {
    const record = {
      'items':[
        { ri_id:'blood_flow', 'name':'Blood Flow', 'unit':'ml/min', 'type':'text', 'data':[{ time:1496888840000, 'value':178, 'status':0 }] },
        { ri_id:'dia_flow', 'name':'Dialysate Flow', 'unit':'ml/min', 'type':'text', 'data':[{ time:1496888840000, 'value':492, 'status':0 }] },
        { ri_id:'pre_dia_temp_value', 'name':'Dialysate Temp.', 'unit':'°C', 'type':'text', 'data':[{ time:1496888840000, 'value':36, 'status':0 }, { time:1496888850000, 'value':37, 'status':0 }] },
        { ri_id:'injection_vol', 'name':'Syringe Volume', 'unit':'u', 'type':'text', 'data':[] },
        { ri_id:'sbp', 'name':'SBP', 'unit':'mmHg', 'type':'chart', 'data':[{ time:1496888640000, 'value':96, 'status':0 }, { time:1496888840000, 'value':97, 'status':0 }] },
        { ri_id:'dbp', 'name':'DBP', 'unit':'mmHg', 'type':'chart', 'data':[{ time:1496888840000, 'value':38, 'status':0 }] },
        { ri_id:'venous', 'name':'VP', 'unit':'mmHg', 'type':'chart', 'data':[{ time:1496888840000, 'value':163, 'status':0 }] },
        { ri_id:'conductivity', 'name':'Conductivity', 'unit':'ms/cm', 'type':'chart', 'data':[{ time:1496888840000, 'value':14, 'status':0 }] },
        { ri_id:'tmp', 'name':'TMP', 'unit':'mmHg', 'type':'chart', 'data':[{ time:1496888840000, 'value':111, 'status':0 }] },
        { ri_id:'uf', 'name':'UFR', 'unit':'L/hr', 'type':'chart', 'data':[{ time:1496888840000, 'value':0.75, 'status':0 }] },
        { ri_id:'total_uf', 'name':'UF', 'unit':'kg', 'type':'chart', 'data':[{ time:1496888840000, 'value':0.028, 'status':0 }] },
        { ri_id:'pulse', 'name':'Pulse', 'unit':'beats/min', 'type':'chart', 'data':[{ time:1496888840000, 'value':70, 'status':0 }] },
        { ri_id:'deltadia_temp_value', 'name':'Dialysate Temp.', 'unit':'°C', 'type':'text', 'data':[{ time:1496888840000, 'value':36, 'status':0 }, { time:1496888850000, 'value':37, 'status':0 }] },
        { ri_id:'target_uf', 'name':'TARGET UF', 'unit':'ml', 'type':'calc', 'data':[{ time:1496888840000, 'value':0.028, 'status':0 }] },
        { ri_id: 'delta_uf', name: 'delta UF', unit: 'L', type: 'calc', data: [{ time:1496888840000, 'value':0, 'status':0 }] },
        { ri_id: 'delta_bloodflow', name: 'Delta Blood Flow', unit: 'ml/min', type: 'calc', data: [{ time:1496888840000, 'value':0, 'status':0 }] },
      ],
      temperature:1,
      dryweight:45,
      dialysis_year:1,
    }
    const patient = {
      'pat_no':'01559093',
      'hdrec_id':'29B1E9F15DF8442C70E35CE99C201706',
      'dryweight':'45',
      'temperature':'1',
      'birth':'1939-11-28T00:00:00.000Z',
      'gender':'F',
      'DISEASE_1':'', 'DISEASE_2':'', 'DISEASE_3':'', 'DISEASE_4':'', 'DISEASE_5':'', 'DISEASE_6':'', 'DISEASE_7':'', 'DISEASE_8':'',
      'age':77,
      'diseases':[{ 'd_id':'dm', 'd_name':'糖尿病不重要的字串' }],
    }

    const patient1 = {
      'pat_no':'01559093',
      'hdrec_id':'29B1E9F15DF8442C70E35CE99C201706',
      'dryweight':'45',
      'temperature':'1',
      'birth':'1939-11-28T00:00:00.000Z',
      'gender':'F',
      'DISEASE_1':'', 'DISEASE_2':'', 'DISEASE_3':'', 'DISEASE_4':'', 'DISEASE_5':'', 'DISEASE_6':'', 'DISEASE_7':'', 'DISEASE_8':'',
      'age':77,
    }
    try {
      // test with patient.diseases's d_id = dm
      let result = await co(Overviews.getPredictDataAndLastTime(record, patient))
      let predictData = result.predictData
      if (!predictData.ns) {
        predictData.ns = 50
      }
      if (isValidate(false, predictData) == true) {
        Protos.BPVar.request.encode(predictData).toBuffer()
      } else {
        expect(predictData).toBe(true)
      }
      // test with patient.diseases's is null
      result = await co(Overviews.getPredictDataAndLastTime(record, patient1))
      predictData = result.predictData
      if (!predictData.ns) {
        predictData.ns = 50
      }
      if (isValidate(false, predictData) == true) {
        Protos.BPVar.request.encode(predictData).toBuffer()
      } else {
        expect(predictData).toBe(true)
      }
    } catch(e) {
      expect(e).toBe(false)
    }
  })
})


describe('[unit] The checkVarRisk function in the Overviews modules', function() {
  it('Test call function with correct data', async () => {
    let { predictData } = await co(Overviews.getPredictDataAndLastTime(record, patient))
    let chartData = {
      res_bp_variation : [
        { // 11:23
          UB_UB : 80,
          UB : 150,
          LB : 100,
          LB_LB : 90,
        },
        { // 11:24
          UB_UB : 1.1,
          UB : 130,
          LB : 120,
          LB_LB : 130,
        },
        { // 11:25
          UB_UB : 80,
          UB : 150,
          LB : 100,
          LB_LB : 80,
        },
        {
          UB_UB : 80,
          UB : 150,
          LB : 100,
          LB_LB : 80,
        },
      ],
    }
    const diffStart = 1 // 'now -> 2017-03-02 11:23'
    const diffEnd = 2  // 11:24, 11:25
    const lastTime = '2017-03-02 11:22:33'
    let expectRisk = {
      risk_time:'2017-03-02 11:25:33',
      type:'middle',
    }
    let result = await co(Overviews.checkVarRisk(lastTime, predictData, chartData, diffStart, diffEnd))
    expect(result).toEqual(expectRisk)
    chartData = {}
    result = await co(Overviews.checkVarRisk(lastTime, predictData, chartData, diffStart, diffEnd))
    expect(result).toEqual({})
  })
})

// describe('[unit] The checkProbRisk function in the Overviews modules', function() {
//   it('Test call function with correct data', async () => {
//     let chartData = { res_bp_probability : [50, 80, 100, 40, 30, 70] }
//     const diffStart = 0
//     const diffEnd = 300
//     let result = await co(Overviews.checkProbRisk(chartData, diffStart, diffEnd))
//     expect(result).toBe(true)
//     chartData = {}
//     result = await co(Overviews.checkProbRisk(chartData, diffStart, diffEnd))
//     expect(result).toBe(false)
//   })
// })
//
// describe('[unit] The checkEstRisk function in the Overviews modules', function() {
//   it('Test call function with correct data', async () => {
//     let chartData = {
//       res_bp_estimation : [{
//         Upper_bound : 30,
//         Lower_bound : 10,
//         Predict : 10,
//       }],
//     }
//     const diffStart = 0
//     const diffEnd = 300
//     let result = await co(Overviews.checkEstRisk(chartData, diffStart, diffEnd))
//     expect(result).toBe(true)
//     chartData = {}
//     result = await co(Overviews.checkEstRisk(chartData, diffStart, diffEnd))
//     expect(result).toBe(false)
//   })
// })

describe('[unit] The tuningMaxbloodLower function in the Overviews modules', function() {
  it('Test call function with different case of sbp, put config in setup-test-server-env \
      to avoid change here every time after config have been changed', async () => {
    let result = tuningMaxbloodLower(150)
    expect(result).toEqual({ type: 'upper', maxblood_lower: 120 })
    result = tuningMaxbloodLower(140)
    expect(result).toEqual({ type: 'middle', maxblood_lower: 119 })
    result = tuningMaxbloodLower(90)
    expect(result).toEqual({ type: 'lower', maxblood_lower: 81 })
  })
})
