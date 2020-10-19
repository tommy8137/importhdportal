import { validateDateFormat, validateDateRange } from 'server/utils/api-validate-parameter'
import moment from 'moment'

describe('[unit] The validateDateFormat function in the server/utils/api-validate-parameter', function() {
  // -----------------------------------------------------------------------------
  it('Test function with corrcet startDate, endDate format', async () => {
    try {
      validateDateFormat('2017-01-01', '2017-01-01')
    } catch(e) {
      expect(false).toBe(true)
    }
  })

  it('Test function with incorrcet startDate format', async () => {
    try {
      validateDateFormat('2017/01-01', '2017-01-01')
      expect(false).toBe(true)
    } catch(e) {
      expect(e.message).toBe('The startDate format should be YYYY-MM-DD')
    }
  })

  it('Test function with incorrcet endDate format', async () => {
    try {
      validateDateFormat('2017-01-01', '2017/1-/01')
      expect(false).toBe(true)
    } catch(e) {
      expect(e.message).toBe('The endDate format should be YYYY-MM-DD')
    }
  })
})

describe('[unit] The validateDateRange  function in the server/utils/api-validate-parameter', function() {
  // -----------------------------------------------------------------------------
  it('Test function with corrcet startDate, endDate range', async () => {
    let day = moment().format('YYYY-MM-DD')
    try {
      validateDateRange(day, day)
    } catch(e) {
      expect(false).toBe(true)
    }
  })

  it('Test function with incorrcet startDate range', async () => {
    let startDate = moment().subtract(0.5, 'years')
    startDate = moment().subtract(1, 'days').format('YYYY-MM-DD')
    const endDate = moment().subtract(0.5, 'years').format('YYYY-MM-DD')
    try {
      validateDateRange(startDate, endDate)
      expect(false).toBe(true)
    } catch(e) {
      expect(e.message).toBe('The start_date/end_date range is invaild')
    }
  })

  it('Test function with incorrcet endDate range', async () => {
    const startDate = moment().subtract(0.5, 'years').format('YYYY-MM-DD')
    let endDate = startDate
    endDate = moment(startDate).subtract(1, 'days').format('YYYY-MM-DD')
    try {
      validateDateRange(startDate, endDate)
      expect(false).toBe(true)
    } catch(e) {
      expect(e.message).toBe('The start_date/end_date range is invaild')
    }
    endDate = moment().add(1, 'days').format('YYYY-MM-DD')
    try {
      validateDateRange(startDate, endDate)
      expect(false).toBe(true)
    } catch(e) {
      expect(e.message).toBe('The start_date/end_date range is invaild')
    }
  })
})
