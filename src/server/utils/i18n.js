import fs from 'fs'
import path from 'path'
import { fromJS } from 'immutable'
import stripJsonComments from 'strip-json-comments'
import { nexeFs } from 'server/utils/nexe-fs'
import { nexePath } from 'common/nexe-path'

const pathLocales = nexePath.convert(path.join(__dirname, '../..', 'app', 'locales'))
const locales =  fs.readdirSync(pathLocales).reduce(
    (result, l) => {
      const rule = /(.*)\.txt$/
      if (!rule.test(l)) {
        return result
      }

      const localeName = rule.exec(l)[1]
      const txt = fs.readFileSync(path.join(pathLocales, l), 'utf8')
      result[localeName] = JSON.parse(stripJsonComments(txt))
      return result
    },
    {})

for (let l in locales) {
  locales[l] = fromJS({ name: l, locale: { ...locales['zh-tw'], ...locales[l] } })
}

export default (language) => locales[language] || locales['zh-tw']
