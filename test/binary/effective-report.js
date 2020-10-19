import fs from 'fs'
import path from 'path'

describe('About the issue of obfuscator result', function() {

  // -----------------------------------------------------------------------------
  it('should not have any semicolon immediately following the return', async () => {
    const filePath = path.resolve('build/server/models/maya/effective/template.js')
    const obfuscatorResult = await fs.readFileSync(filePath, 'utf8')
    const pattern = new RegExp('return[ ]*;') // zero or more space and ;
    const isError = pattern.test(obfuscatorResult)
    expect(isError).toEqual(false)
  })
  // -----------------------------------------------------------------------------

})
