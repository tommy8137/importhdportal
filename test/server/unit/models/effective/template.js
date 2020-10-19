import getHtml from 'server/models/maya/effective/template'
import moment from 'moment'
import co from 'co'

describe('[unit] The getHtml function in the Accuracy template', function() {
  it('should return a html ', async () => {
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

    co(getHtml(parametObject)).then((res) => {
      expect('string').toBe(typeof res)
    })
  })
})
