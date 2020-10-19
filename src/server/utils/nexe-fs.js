import fs from 'fs'

export const nexeFs = {
  readFileSync : (filePath, encoding) => {
    try {
      // skip npm run build to checkout
      const nexeRequire = require
      const nexeres = nexeRequire('nexeres')
      const fileName = 'build/' + filePath
      return nexeres.get(fileName, encoding).toString()
    } catch (error) {
      // console.error(`for dev mode checkout by node, because the nexeres which doesn\'t install by npm,
      //   will not access here --- filePath = ${filePath}, error = ${error} `)
    }
    const fileName =  filePath
    return fs.readFileSync(fileName, encoding)
  },
}
