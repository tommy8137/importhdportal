import Protos from 'common/protos'
import co from 'co'
import Schedules from 'server/api/maya/searches/schedules.js'
import moment from 'moment'

describe('[unit] The list function in the Schedules modules', function() {
  // -----------------------------------------------------------------
  // Global variable
  // -----------------------------------------------------------------
  const mockReturnValue = {
    'total_nums': 2,
    'schedule_patients':
    [
      {
        'date': 'yyyy-mm-dd',
        'name': 'name',
        'gender': 'F|M',
        'patient_id': '<p_id>',
        'bed_no': '<bed_no>',
        'schedule': 1,
        'progress': '<Not Started|Under Dialysis|Finished> (<已報到|透析中|透析結束>)',
        'r_id': '<r_id>',
      },
      {
        'date': 'yyyy-mm-dd',
        'name': 'name',
        'gender': 'F|M',
        'patient_id': '<p_id>',
        'bed_no': '<bed_no>',
        'schedule': 2,
        'progress': '<Not Started|Under Dialysis|Finished> (<已報到|透析中|透析結束>)',
        'r_id': '<r_id>',
      },
    ],
  }
  const shiftsBuffer = Protos.Schedule.response.encode(mockReturnValue).toBuffer()
  const expectType = 'application/octet-stream'
  const schedulesObj = new Schedules()

  // -----------------------------------------------------------------
  // Test cases
  // -----------------------------------------------------------------
  it('should throw error when startDate format is not YYYY-MM-DD', async () => {

    const genThis = function () {
      return {
        models: {
          getSchedules: jest.fn(
            function* getSchedules() {
              return mockReturnValue
            }
          ),
        },
        query: {
          start_date: '2015/08/07',
          end_date: '2015-08-08',
          offset: 0,
          limit: 20,
          sort: '-name',
        },
      }
    }

    const Mock = jest.fn().mockImplementation(genThis)
    const mock = new Mock()
    try {
      await co(schedulesObj.list.apply(mock))
      expect(true).toBe(false)
    } catch(err) {
      expect(err.message).toBe('The startDate format should be YYYY-MM-DD')
    }
  })

  // -----------------------------------------------------------------
  it('should throw error when endDate format is not YYYY-MM-DD', async () => {
    const genThis = function () {
      return {
        models: {
          getSchedules: jest.fn(
            function* getSchedules() {
              return mockReturnValue
            }
          ),
        },
        query: {
          start_date: '2015-08-07',
          end_date: '20150808',
          offset: 0,
          limit: 20,
          sort: '-name',
        },
      }
    }

    const Mock = jest.fn().mockImplementation(genThis)
    const mock = new Mock()

    try {
      await co(schedulesObj.list.apply(mock))
      expect(true).toBe(false)
    } catch(err) {
      expect(err.message).toBe('The endDate format should be YYYY-MM-DD')
    }
  })

  // -----------------------------------------------------------------
  it('should throw error when offset less than 0', async () => {
    const day = moment().format('YYYY-MM-DD')
    const genThis = function () {
      return {
        models: {
          getSchedules: jest.fn(
            function* getSchedules() {
              return mockReturnValue
            }
          ),
        },
        query: {
          start_date: day,
          end_date: day,
          offset: -1,
          limit: 20,
          sort: '-name',
        },
      }
    }

    const Mock = jest.fn().mockImplementation(genThis)
    const mock = new Mock()
    try {
      await co(schedulesObj.list.apply(mock))
      expect(true).toBe(false)
    } catch (err) {
      expect(err.name).toBe('Error')
      expect(err.message).toBe('The offset parameter should not be negative number')
    }
  })

  // -----------------------------------------------------------------
  it('should call the getSchedules with specific arguments', async () => {
    const day = moment().format('YYYY-MM-DD')
    const genThis = function () {
      return {
        models: {
          getSchedules: jest.fn(
            function* getSchedules() {
              return mockReturnValue
            }
          ),
        },
        query: {
          start_date: day,
          end_date: day,
          offset: 0,
          limit: 20,
          sort: '-name',
        },
      }
    }

    const Mock = jest.fn().mockImplementation(genThis)
    const mock = new Mock()
    await co(schedulesObj.list.apply(mock))
    expect(mock.models.getSchedules.mock.calls[0])
      .toEqual([day, day, 0, 20, '-name', undefined])
  })
  // -----------------------------------------------------------------
  it('should return the schedules', async () => {
    const day = moment().format('YYYY-MM-DD')
    const genThis = function () {
      return {
        models: {
          getSchedules: jest.fn(
            function* getSchedules() {
              return mockReturnValue
            }
          ),
        },
        query: {
          start_date: day,
          end_date: day,
          offset: 0,
          limit: 20,
          sort: '-name',
        },
      }
    }

    const Mock = jest.fn().mockImplementation(genThis)
    const mock = new Mock()
    await co(schedulesObj.list.apply(mock))
    expect(mock.body).toEqual(shiftsBuffer)
    expect(mock.type).toEqual(expectType)
  })
  // -----------------------------------------------------------------
  it('should import Schedule models when this.modules does not exist.', async () => {
    const day = moment().format('YYYY-MM-DD')
    const genThis = function () {
      return {
        query: {
          start_date: day,
          end_date: day,
          offset: 0,
          limit: 20,
          sort: '-name',
        },
      }
    }
    const successHandler = function() {
    }
    const errorHnadler = function(err) {
      console.warn(err)
    }
    co(schedulesObj.list.apply(genThis())).then( successHandler, errorHnadler)
  })
})
