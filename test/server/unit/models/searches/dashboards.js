import co from 'co'
import Dashboards from 'server/models/maya/searches/dashboards.js'
import Protos from 'common/protos'
import { hospitalDB } from 'server/helpers/database'

describe('[unit] The getDashboards function in the Dashboards modules', function() {
  // -----------------------------------------------------------------------------
  it('Test spec case of begin_weight, end_weight,  hp_first, hp_continue,  vpre_max_blood, vpre_min_blood, vpost_max_blood, vpost_min_blood   in vi_TYHD_PAT_HD_MASTER', async () => {
    const result = await co(Dashboards.getDashboards('0001982205', '0010535CFF4DE9E8D0B1968CDDDF5B5C')) // '27583875','0C3E43B942AA04163D2B6E44BFE85B84'
    try {
      Protos.Dashboard.response.encode(result).toBuffer()
    } catch(e) {
      expect(e).toBe(result)
    }
  })
  // -----------------------------------------------------------------------------
  it('Test hp_first != \'\' in vi_TYHD_PAT_HD_MASTER', async () => {
    const result = await co(Dashboards.getDashboards('0001521343', '00054A5AAEF2CE727539E81971A18CC7')) // '21683214','428EF5208B46FD3E720674DCB6E157A6'
    try {
      Protos.Dashboard.response.encode(result).toBuffer()
    } catch(e) {
      expect(e).toBe(result)
    }
  })
  // -----------------------------------------------------------------------------
  it('Test pat_no and hdrec_id is incorrect', async () => {
    const result = await co(Dashboards.getDashboards('what_ever', 'what_ever'))
    try {
      Protos.Dashboard.response.encode(result).toBuffer()
    } catch(e) {
      expect(e).toBe(result)
    }
  })
  // -----------------------------------------------------------------------------
  // it('Test nur.nurserec != \'\' in MEMO', async () => {
  //   const result = await co(Dashboards.getDashboards('0001521343', '00054A5AAEF2CE727539E81971A18CC7')) // '02090268','847E9D76487F1D2F640004B072E33E7F'
  //   try {
  //     Protos.Dashboard.response.encode(result).toBuffer()
  //   } catch(e) {
  //     expect(e).toBe(result)
  //   }
  // })
  // // -----------------------------------------------------------------------------
  // it('Test ev_type = 醫囑 in MEMO', async () => {
  //   const result = await co(Dashboards.getDashboards('0001521343', '00054A5AAEF2CE727539E81971A18CC7')) //'03493090','E4E49356C943502A50BF871697BFACEE'
  //   try {
  //     Protos.Dashboard.response.encode(result).toBuffer()
  //   } catch(e) {
  //     expect(e).toBe(result)
  //   }
  // })
  // // -----------------------------------------------------------------------------
  // it('Test ev_type = 警報 in MEMO', async () => {
  //   const result = await co(Dashboards.getDashboards('0001917182', '022141CCB9B741756B347DCAD1FF013E')) // '16947785','0B8DE86BB5FB1F267F7CD8DF5DBA728C'
  //   try {
  //     Protos.Dashboard.response.encode(result).toBuffer()
  //   } catch(e) {
  //     expect(e).toBe(result)
  //   }
  // })
  // // -----------------------------------------------------------------------------
  // it('Test ev_type = 問題 in MEMO', async () => {
  //   const result = await co(Dashboards.getDashboards('0001380307', '0007554E77610174C6D904EE71471BC4')) //'16459120','AAF61CD4CB25DE80B647CE8333A958E5'
  //   try {
  //     Protos.Dashboard.response.encode(result).toBuffer()
  //   } catch(e) {
  //     expect(e).toBe(result)
  //   }
  // })

  // -----------------------------------------------------------------------------
  it('Test status include abnormal(2) and critical(3) in TYHD_LAB_DATA data', async () => {
    const pat_no = '0000033417'
    const hdrec_id = '7FD5715B166310ECB733F168DDABCF3C'
    const sqlCondition = `WHERE patient_id = '${pat_no}' and ISNUMERIC(lab_result) = 1 AND report_dt = '20170405' and base_code ='09002'`
    const backData = await co(hospitalDB.Query(`SELECT status
                                                FROM tyhd_lab_data
                                                ${sqlCondition}`))
    const result = await co(Dashboards.getDashboards(pat_no, hdrec_id)) // '01070743','008BDAA08816F342DD9E4948A5E65CC3'
    await co(hospitalDB.Query(`UPDATE tyhd_lab_data
                               SET status = '3'
                               ${sqlCondition}`))

    const result1 = await co(Dashboards.getDashboards(pat_no, hdrec_id)) // '01070743','008BDAA08816F342DD9E4948A5E65CC3'

    try {
      Protos.Dashboard.response.encode(result).toBuffer()
      Protos.Dashboard.response.encode(result1).toBuffer()
    } catch(e) {
      expect(e).toBe(result)
    } finally {
      const status = backData.rows[0].status
      await co(hospitalDB.Query(`UPDATE tyhd_lab_data
                               SET status = '${status}'
                               ${sqlCondition}`))
    }
  })
})
