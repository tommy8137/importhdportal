import { Record, List } from 'immutable'
import { Schema, arrayOf } from 'normalizr'

export const upperFields = 'text'
export const leftFields = 'chart'

const record = new Schema('record', { idAttribute: 'r_id' })
const paramsSchema = new Schema('params', { idAttribute: 'ri_id' })
export const itemSchema = new Schema('items', { idAttribute: 'ri_id' })
export const preSchema = new Schema('pre', { idAttribute: 'pi_id' })
export const postSchema = new Schema('post', { idAttribute: 'pi_id' })
export const intraSchema = new Schema('intra', { idAttribute: 'pi_id' })

record.define({
  items: itemSchema,//arrayOf(itemSchema),
  panels: {
    pre: arrayOf(preSchema),
    post: arrayOf(postSchema),
    intra: arrayOf(intraSchema),
  },
})

export default record
