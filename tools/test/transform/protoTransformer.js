const fs = require('fs')

module.exports = {
  process(src, filename, config, options) {
    const msg = fs.readFileSync(filename).toString()
    return `module.exports=${JSON.stringify(msg)};`
  }
}
