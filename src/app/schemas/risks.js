import { Schema, arrayOf } from 'normalizr'

export const CategoryItem = new Schema('category', { idAttribute: 'c_id' })
export const LibItem = new Schema('lib', { idAttribute: 'c_id' })

const ModuleItem = new Schema('module', { idAttribute: 'm_id' })

CategoryItem.define({
  module: arrayOf(ModuleItem),
})

LibItem.define({
  modules: arrayOf(ModuleItem)
})
