import { Record } from 'immutable'
import { Schema, arrayOf } from 'normalizr'

export const status = 'status_hightlight'
export const record = 'dialyze_records'
export const test = 'dialysis_test_result'

const abnormalSchema = new Schema('abnormal', { idAttribute: 'pi_id' })
const handledSchema = new Schema('handled', { idAttribute: 'pi_id' })
const testAbnormalSchema = new Schema('abnormal', { idAttribute: 'ti_id' })
const testCriticalSchema = new Schema('critical', { idAttribute: 'ti_id' })
const statusSchema = new Schema(status)
const dashboardSchema = new Schema('dashboard')
export const recordSchema = new Schema(record, { idAttribute: 'r_id' })
export const testSchema = new Schema(test, { idAttribute: 'tr_id' })

recordSchema.define({
  abnormal: arrayOf(abnormalSchema),
  handled: arrayOf(handledSchema),
})

testSchema.define({
  abnormal: arrayOf(testAbnormalSchema),
  critical: arrayOf(testCriticalSchema),
})

dashboardSchema.define({
  [record]: recordSchema,
  [test]: testSchema,
})

export const StatusRecord = Record({ pre: '--', post: '--' })

export default dashboardSchema
