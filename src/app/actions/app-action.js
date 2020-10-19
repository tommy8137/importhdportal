import TYPES from 'constants/action-types'

export function appBusy(isBusy = false, eventSource) {
	return {
		type: TYPES.APP_LOADING,
		isBusy,
    eventSource,
	}
}

export function switchLang(lang) {
  return {
    type: TYPES.LOCALE_SET_SWITCH,
    lang,
  }
}

export function closeModal() {
  return {
    type: TYPES.APP_SET_MODAL,
    visible: false,
    // dont clear neither title nor content here! otherwise, user will see the blank flash.
    // title: null,
    // content: null,
  }
}
