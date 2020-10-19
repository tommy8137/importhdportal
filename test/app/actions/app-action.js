import { appBusy, switchLang } from 'app/actions/app-action'
import TYPES from 'app/constants/action-types'


it('an action to set app to be busy', () => {
  expect(appBusy(true)).toEqual({ type: TYPES.APP_LOADING, isBusy: true })

})
it('default behavior of appBusy should not be busy', () => {
  expect(appBusy()).toEqual({ type: TYPES.APP_LOADING, isBusy: false })
})

it('switch language should work correctly', () => {
  const switchTo = 'zh-tw'
  const ac = switchLang(switchTo)
  expect(ac).toEqual({ type: TYPES.LOCALE_SET_SWITCH, lang: switchTo })
})
