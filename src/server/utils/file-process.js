import Promise from 'bluebird'
import archiver from 'archiver'
import parse from 'co-busboy'
import fs from'fs'
import path from 'path'
import fstream from 'fstream'
import unzip from 'unzip'
import { errorCode } from 'server/helpers/api-error-helper'

export default class FileProcess {

  static uploadFileMessage(fileName, uploadTime) {

    let message = {
      file_name: fileName,
      upload_time: uploadTime,
    }

    return message
  }

  // ex:dirPath = 'logs/', compressExtName = '.log'
  static getCompressZipFile(outputStream, dirPath, compressExtName) {
    return new Promise((fulfill, reject) => {
      const archive = archiver('zip')
      archive.on('error', function (err) {
        reject({ message: err, code: errorCode.INTERNAL_ERROR })
      })

      archive.bulk([{ expand: true, cwd: `${dirPath}`, src: [`*${compressExtName}`] }])
      archive.finalize()
      const file = archive.pipe(outputStream)

      fulfill(file)
    })
  }

  static uploadFormDataFile(inputFileStream, outputfilePath) {
    return new Promise((fulfill, reject) => {
      const stream = fs.createWriteStream(outputfilePath)
      inputFileStream.pipe(stream)

      inputFileStream.on('error', (err) => {
        reject({ message: err, code: errorCode.UPLOAD_FILES_ERROR })
      })

      inputFileStream.on('end', () => {
        fulfill(outputfilePath)
      })

    })
  }

  static checkExtName(extNameArray, fileName) {
    return new Promise((fulfill, reject) => {
      let extRe = ''
      let extNote = ''
      extNameArray.forEach((element, index) => {
        extRe += `${element}|`
        extNote += `${element},`
      })
      extRe = extRe.slice(0, extRe.lastIndexOf('|'))
      extNote = extNote.slice(0, extRe.lastIndexOf(','))
      const reCheck = new RegExp(`\.(${extRe})$`)
      if(!reCheck.test(fileName)) {
        reject({ message: `Upload file should ${extNote}`, code: errorCode.MODULE_FILE_FORMAT_ERROR })
      }
      else {
        fulfill(fileName)
      }
    })
  }

  static decompressZipFile(sourceFilePath, outputTargetDir) {
    return new Promise((resolve, reject) => {
      const source = fs.createReadStream(sourceFilePath)
      const output = fstream.Writer(outputTargetDir)
      source.pipe(unzip.Parse()).pipe(output)

      source.on('error', (err) => {
        reject({ message: err, code: errorCode.FILE_DECOMPRESS_ERROR })
      })

      source.on('end', () => {
        resolve(outputTargetDir)
      })
    })
  }


}
