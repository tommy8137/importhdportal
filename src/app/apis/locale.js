import stripJsonComments from 'strip-json-comments'

if (typeof require.ensure !== 'function') require.ensure = (d, c) => c(require)

export const requireLocale = (language = 'zh-tw') => new Promise((resolve, reject) => {
  if (__CLIENT__) {
    let locale
    switch (language) {
      case 'zh-tw':
        require.ensure([], (require) => {
          locale = require('../locales/zh-tw.txt')
          resolve(JSON.parse(stripJsonComments(locale)))
        })
        break
      case 'zh-cn':
        require.ensure([], (require) => {
          locale = require('../locales/zh-cn.txt')
          resolve(JSON.parse(stripJsonComments(locale)))
        })
        break
      case 'en':
        require.ensure([], (require) => {
          locale = require('../locales/en.txt')
          resolve(JSON.parse(stripJsonComments(locale)))
        })
        break
      default:
        console.warn(`${language} is not in 'zh-tw', 'zh-cn', 'en'`)
        break
    }
  } else {
    throw new Error('requireLocale should be called at client side only. try to set the initial locale state directly.')
  }
})
