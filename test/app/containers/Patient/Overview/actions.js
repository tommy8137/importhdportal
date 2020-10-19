import TYPES from 'app/constants/action-types'
import { changeShift, changeCategory } from 'app/containers/Patient/Overview/actions'
import { changeShiftTask, changeCategoryTask } from 'app/containers/Patient/Overview/saga'

it('overview-action: changeShift(shift)', () => {
  const shift = ['all', 'morning', 'mid', 'evening']
  shift.forEach(shift => {
    expect(changeShift(shift)).toEqual({
      type: TYPES.SAGA_CUSTOM_TASK,
      task: changeShiftTask,
      args: [shift],
    })
  })
})

// it('overview-action: changeCategory(shift, category)', () => {
//   const shifts = ['all', 'morning', 'mid', 'evening']
//   const categories = ['all', '低血壓', '併發症', '廔管壽命', '死亡率']
//   shifts.forEach((shift) => {
//     categories.forEach(category => {
//       expect(changeCategory(shift, category)).toEqual({
//         type: TYPES.SAGA_CUSTOM_TASK,
//         task: changeCategoryTask,
//         args: [shift, category],
//       })
//     })
//   })
// })
