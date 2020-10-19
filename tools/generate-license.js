import Cipher from 'cipher'
import fs from 'fs'
import path from 'path'

const pwd = {}
pwd.licensePwd = fs.readFileSync(path.join(__dirname, '../keys/licensePwd'))
pwd.licenseHmacPwd = fs.readFileSync(path.join(__dirname, '../keys/licenseHMACPwd'))

const j = '{ "start_date": "2011-05-26T07:56:00.123Z", "end_date": "2021-05-26T07:56:00.123Z", "version": "vvv"}'
const crypt = new Cipher(pwd)
fs.writeFileSync(path.join(__dirname, '../keys/licenseKey'), crypt.encrypt(j))
