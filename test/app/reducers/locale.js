import reducer from 'app/reducers/locale-reducer';
import { fromJS } from 'immutable'
import TYPES from 'app/constants/action-types'
import stripJsonComments from 'strip-json-comments'
import fs from 'fs'

const zhtwTxt = fs.readFileSync('./src/app/locales/zh-tw.txt', 'utf8')
const zhcnTxt = fs.readFileSync('./src/app/locales/zh-cn.txt', 'utf8')
const zhtw = JSON.parse(stripJsonComments(zhtwTxt))
const zhcn = JSON.parse(stripJsonComments(zhcnTxt))

const defaultLocale = fromJS({
  name: 'not available',
  locale: {},
})

it('default locale should be empty', () => {
  const state = reducer(undefined, {})
  expect(state).toEqual(defaultLocale)
})

it('should be able to switch the locale', () => {
  const state = reducer(undefined, { type: TYPES.LOCALE_SWITCH, locale: zhcn, language: 'zh-cn' })
  expect(state.toJS()).toEqual({ locale: zhcn, name: 'zh-cn' })
})
