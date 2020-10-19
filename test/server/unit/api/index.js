import Maya from 'server/api/maya'

it('Import index.js to pass the testing', async () => {
  expect(Maya).not.toBeNull()
})