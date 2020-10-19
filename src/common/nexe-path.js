const nexe = process.env.nexe

export const nexePath = {
  convert : (path) => {
    if (nexe != 'y') {
      return path
    }
    let nexePath = path.split('build/')
    if (nexePath.length == 1) {
      nexePath = path.split('web-portal-2.1/')
      nexePath = nexePath.length > 1 ? nexePath[1] : path
    } else {
      nexePath = nexePath[1]
    }
    return nexePath
  },
}
