export const normalizr = (list, key) => {
  const new_list = {}
  list.forEach(data => {
    const id = data[key]
    new_list[id] = data
  })
  return new_list
}
