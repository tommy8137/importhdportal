import TYPES from 'constants/action-types'
import { browserHistory } from 'react-router'

export function selectPatient(user) {
  browserHistory.push(`/patient/${user.id}/dashboard/${user.recordId}`)
  return {
    type: TYPES.PATIENT_SELECT_PATIENT,
    patientId: user.id,
    recordId: user.recordId,
  }
}

export function selectRecord(recordId, to) {
  browserHistory.push(to)
  return {
    type: TYPES.PATIENT_SELECT_RECORD,
    recordId,
  }
}

export function selectPatientRisk(user) {
  browserHistory.push(`/patient/${user.patientId}/risk/${user.rId}?c_id=${user.c_id}&m_id=${user.m_id}`)
  return {
    type: TYPES.PATIENT_SELECT_PATIENT,
    patientId: user.id,
    recordId: user.recordId,
  }
}
