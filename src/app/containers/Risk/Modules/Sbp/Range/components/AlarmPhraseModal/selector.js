import { createSelector } from 'reselect'

export default createSelector(
  (state) => state.globalConfigs.get('notesformat'),
  (notesformat) => {
    return {
      notesformat,
    }
  }
)
