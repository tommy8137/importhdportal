import { createSelector } from 'reselect'
import { fromJS } from 'immutable'
import { localeSelector } from 'reducers/locale-reducer'

const recordsSelector = createSelector(
  (state) => state.patient.get('record').get('entities'),
  (records) => records
    ? records
      .map((record) => ({ value: record.get('r_id'), label: record.get('date') }))
      .toArray()
      .sort((a, b) => a.label > b.label ? 1: -1)
    : []
)

export default createSelector(
  (state) => state.patient,
  recordsSelector,
  localeSelector,
  (state) => state.routing.locationBeforeTransitions,
  (patient, records, l, location) => {
    const record = patient.get('record')
    const recordId = record.get('record_id')
    return {
      l,
      id: patient.get('patient_id'),
      name: patient.get('name'),
      age: patient.get('age'),
      bedNo: patient.get('bed_no'),
      diseases: patient.get('diseases').reduce((s, d) => {
        const dName = l(d.get('d_name'))
        s = (s == '')
        ? dName
        : `${s}、${dName}`
        return s
      }, ''),
      currentRecord: record.getIn(['entities', recordId])? record.getIn(['entities', recordId]): fromJS({}),
      records,
      pathname: location? location.pathname: null,
      search: location? location.search: null,
    }
  }
)
