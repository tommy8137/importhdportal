import { createSelector } from 'reselect'
import { localeSelector } from 'reducers/locale-reducer'
import { maybe } from 'maybes'
import { fromJS } from 'immutable'
import moment from 'moment'

export default createSelector(
  (state) => state.globalConfigs.get('notesformat'),
  localeSelector,
  (state) => state.patient.getIn(['record', 'detail', 'entities', 'items', 'sbp', 'data']),
  (state) => state.patient.getIn(['record', 'risk', 'module', 'state', 'selectedTime']),
  (state) => state.patient.getIn(['record', 'detail', 'result', 'sbp_alarm']),
  (notesformat, l, sbpData, selectedTime, sbpAlarm) => {
    const lastTime = maybe(sbpData)
      .map((sbp) => sbp.last())
      .map((sbpLast) => sbpLast.get('time'))
      .orJust(null)

    const isSelectedLastPoint = (lastTime == selectedTime)
    const isTodayPoint = moment().startOf('day').format('x') <= selectedTime
    const isFreshestPoint = (isTodayPoint && isSelectedLastPoint)

    // find the child object which 'time' is equal to selectedTime
    // if not, then return {}
    const alarmPharse =
      maybe(sbpAlarm)
      .map(
        v => v.filter((v) => v.get('time') == selectedTime)
      )
      .flatMap( // share the orJust with last line
        v => maybe(v)
        .filter(v => v.size) // v.size must > 0, or first() method will error
        .map(v => v.first())
      )
      .orJust(fromJS({}))
    const alarmInfo = getAlarmInfo(l, isFreshestPoint, alarmPharse)

    if (notesformat !== 'dart') {
      return {
        l,
        alarmInfo,
        notesformat,
      }
    } else {
      return {
        l,
        alarmInfo,
        notesformat,
        AContent: alarmPharse.get('AContent'),
        DContent: alarmPharse.get('DContent'),
        RContent: alarmPharse.get('RContent'),
        TContent: alarmPharse.get('TContent'),
        Subject: alarmPharse.get('Subject'),
      }
    }

  }
)

export const STATUS_TALBE = {
  NO_DATA: '-9527',
  NOT_PROCESSED_YET: '0',
  KEEP_OBSERVE: '1',
  PROCESSED: '2',
  NO_RISK: '-1',
  NO_WARN_MSG: '-2',
}

export const STATUS_CODE_TABLE = new Map(
  Object.keys(STATUS_TALBE).map(
    (v) => [STATUS_TALBE[v], v]
  )
)

const getAlarmInfo = (l, isFreshestPoint, alarmPharse) => {
  let statusCode = null
  let rawStatusCode = String(alarmPharse.get('alarm_status'))

  const {
    NO_DATA,
    NOT_PROCESSED_YET,
    KEEP_OBSERVE,
    PROCESSED,
    NO_RISK,
    NO_WARN_MSG,
  } = STATUS_TALBE

  if (STATUS_CODE_TABLE.get(rawStatusCode)) {
    statusCode = rawStatusCode
  } else {
    statusCode = NO_DATA
  }

  const statusCode2Str = STATUS_CODE_TABLE.get(statusCode)
  const alarmTime = alarmPharse.get('alarm_time')

  const alarmPhrase = alarmPharse.get('alarm_phrase')
  const alarmProcess = alarmPharse.get('alarm_process')
  const processTime = alarmPharse.get('process_time')

  let isProcessed = false

  if (isFreshestPoint) {
    switch(statusCode) {
      case NOT_PROCESSED_YET: {
        return {
          statusCode2Str,
          title: l('Hypotension Risk Alert'),
          status: alarmTime,
          alarmPhrase: '',
          alarmProcess: '',
          buttonDisplay: true,
          observeBtnDisable: false,
          processBtnDisable: false,
          textStyle: 'text-red',
          isBlur: false,
          isProcessed,
        }
      }
      case KEEP_OBSERVE: {
        return {
          statusCode2Str,
          title: l('Hypotension Risk Alert'),
          status: l('Observation'),
          alarmPhrase: '',
          alarmProcess: '',
          buttonDisplay: true,
          observeBtnDisable: true,
          processBtnDisable: false,
          textStyle: 'text-orange',
          isBlur: false,
          isProcessed,
        }
      }
      case PROCESSED: {
        return {
          statusCode2Str,
          title: l('Hypotension Risk Alert'),
          status: l('Handled '), // G0069 contain 1 space char
          alarmPhrase,
          alarmProcess,
          processTime,
          buttonDisplay: true,
          observeBtnDisable: true,
          processBtnDisable: true,
          textStyle: 'text-orange',
          isBlur: false,
          isProcessed: true,
        }
      }
      case NO_RISK: {
        return {
          statusCode2Str,
          title: l('No Hypotension Risk'),
          status: l('Within an Hour'),
          alarmPhrase: '',
          alarmProcess: '',
          buttonDisplay: true,
          observeBtnDisable: true,
          processBtnDisable: true,
          textStyle: 'text-green',
          isBlur: false,
          isProcessed,
        }
      }
    }
  } else {
    switch(statusCode) {
      case NOT_PROCESSED_YET: {
        return {
          statusCode2Str,
          title: l('Hypotension Risk Alert'),
          status: l('--'),
          alarmPhrase: '',
          alarmProcess: '',
          buttonDisplay: false,
          textStyle: 'text-red',
          isBlur: true,
          isProcessed,
        }
      }
      case KEEP_OBSERVE: {
        return {
          statusCode2Str,
          title: l('Hypotension Risk Alert'),
          status: l('Observation'),
          alarmPhrase: '',
          alarmProcess: '',
          buttonDisplay: false,
          textStyle: 'text-orange',
          isBlur: true,
          isProcessed,
        }
      }
      case PROCESSED: {
        return {
          statusCode2Str,
          title: l('Hypotension Risk Alert'),
          status: l('Handled '), // G0069 contain 1 space char
          alarmPhrase,
          alarmProcess,
          processTime,
          buttonDisplay: false,
          textStyle: 'text-orange',
          isBlur: true,
          isProcessed: true,
        }
      }
      case NO_RISK: {
        return {
          statusCode2Str,
          title: l('No Hypotension Risk'),
          status: l('--'),
          alarmPhrase: '',
          alarmProcess: '',
          buttonDisplay: false,
          textStyle: 'text-green',
          isBlur: true,
          isProcessed,
        }
      }
    }
  }

  // no-data and others
  return {
    statusCode2Str,
    title: l('No Warning Message'),
    status: l('--'),
    buttonDisplay: false,
    isBlur: true,
  }
}
