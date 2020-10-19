import patient, { initState } from 'app/reducers/patient'
import { initRecord } from 'app/reducers/record'
import TYPES from 'app/constants/action-types'
// import { selectPatient } from 'actions/patient-action'

it('initial state of patient reducer should be correct.', () => {
  const state = patient(undefined, {})
  expect(state.toJS()).toEqual(initState.toJS())
})

it('selecting patient should work correctly.', () => {
  const action = {
    type: TYPES.PATIENT_SELECT_PATIENT,
    patientId: '123',
    record: 'rid',
  }

  const patientId = patient(undefined, action).get('patient_id')
  expect(patientId).toEqual('123')
})
