const fs = require('fs')

const ignoreKeyFile =/true/ig.test(process.env.IGNORE_KEY_FILE)

module.exports = function(path) {
  if (ignoreKeyFile) {
    return null
  } else {
    return fs.readFileSync(path)
  }
}
