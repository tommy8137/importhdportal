import 'babel-polyfill'
import gulp from 'gulp'
import nodemon from 'nodemon'
import merge from 'lodash.merge'
import webpack from 'webpack'
import path from 'path'
import env from 'gulp-env'
import webpackDevMiddleware from 'webpack-dev-middleware'
import webpackHotMiddleware from 'webpack-hot-middleware'
import { exec, spawn } from 'child_process'
import runSequence from 'run-sequence'
import gutil from 'gulp-util'
import del from 'del'
import vinylPaths from 'vinyl-paths'
import apidoc from 'gulp-apidoc'
import mocha from 'gulp-mocha'
import pem from 'pem'
import fs from 'fs'
import source from 'vinyl-source-stream'
import mergeStream from 'merge-stream'
import keypair from 'keypair'
import crypto from 'crypto'
import jwt from 'jsonwebtoken'
import fetch from 'isomorphic-fetch'
import open from 'gulp-open'
import { validLicenseInfo } from './src/server/helpers/licenses/license-entries'

const bs = require('browser-sync').create()
const BROWSER_SYNC_RELOAD_DELAY = 500
let devMiddleware
let bundler
let serverInitialized = false
let bsInitialized = false
let webpackConfig
let sslkeys
let tokenB

const devServerEnv = {
  NODE_ENV: 'development',
  BABEL_ENV: 'development',
  port: process.env['port'] || '8008',
  radiusip: '192.168.101.93',
  radiusport: '10000',
  spip: '192.168.101.93',
  spport: '3000',
  universal: false,
  systemdbip: '192.168.101.93',
  systemdbport: '5432',
  systemdbdatabase: 'wiprognosis',
  systemdbname: 'wiprognosis',
  systemdbpw: 'mysecretpassword',
  mayadbip: '192.168.100.111',
  mayadbport: '1433',
  mayadbdatabase: 'HD',
  mayadbname: 'wi',
  mayadbpw: 'wistron',
  mayasystemip: '192.168.101.93',
  mayasystemport: '443',
  mayasystemprotocol: 'https',
  IGNORE_KEY_FILE: false,
  systemimportdate: '2017-12-18',
  notesformat: 'dart',
  maxblood_lower: 100,
  maxblood_upper: 140,
  backgroundpic: 'ECK',
}

gulp.task('javascript-obfuscator', () => {
  const gulp = require('gulp')
  const javascriptObfuscator = require('gulp-javascript-obfuscator')
  gulp.src('build/**/*.js')
    .pipe(javascriptObfuscator({
      stringArray: false,
      disableConsoleOutput: false,
      compact: true,
    }))
    .pipe(gulp.dest('build'))
})

gulp.task('default', () => {

})

gulp.task('clean', cb => {
  return gulp.src(['.tmp', 'build/*', '!build/.git'])
    .pipe(vinylPaths(del))
})

gulp.task('copy', ['clean'], () => {
  return gulp.src(['src/app/public/**/*', 'src/app/content/**/*'], { base: 'src/app'})
    .pipe(gulp.dest('build'))
})

gulp.task('copy_jpg_ECK', () => {
  return gulp.src(['src/app/public/**/*'], )
    .pipe(gulp.dest('build/public_ECK/'))
})

gulp.task('copy_jpg_default', () => {
  return gulp.src(['src/app/public/**/*'], )
    .pipe(gulp.dest('build/public_default/'))
})

gulp.task('dev', () => {
  let tasks = null
  if(devServerEnv.backgroundpic == 'ECK') {
    tasks = ['copy_jpg_ECK', 'initWebpack_ECK', 'dev-server', 'get-dev-token', 'browser-sync']
  } else {
    tasks = ['copy_jpg_default', 'initWebpack_default', 'dev-server', 'get-dev-token', 'browser-sync']
  }
  try {
    fs.accessSync('./keys/key_rsa')
    fs.accessSync('./keys/key_rsa.pub')
  } catch (ex) {
    tasks.unshift('generate-jwt-keys')
  }
  try {
    // maya_auth_key_rsa for develop
    fs.accessSync('./keys/maya_auth_key_rsa')
    fs.accessSync('./keys/maya_auth_key_rsa.pub')
    fs.accessSync('./keys/maya_access_key_rsa')
    fs.accessSync('./keys/maya_access_key_rsa.pub')
  } catch (ex) {
    tasks.unshift('maya-jwt-keys')
  }
  try {
    fs.accessSync('./keys/domain.key', fs.F_OK)
    fs.accessSync('./keys/domain.key', fs.F_OK)
  } catch (ex) {
    tasks.unshift('generate-https-cert')
  }
  try {
    fs.accessSync('./keys/licensePwd', fs.F_OK)
    fs.accessSync('./keys/licenseHMACPwd', fs.F_OK)
  } catch (ex) {
    tasks.unshift('generate-license-pwd')
  }

  try {
    fs.accessSync('./keys/license.key', fs.F_OK)
  } catch (err) {
    tasks.unshift('generate-dev-license')
  }

  runSequence(...tasks)
})

gulp.task('browser-sync', async (cb) => {
  bs.init({
    proxy: {
      target: `https://localhost:${devServerEnv.port}/entry?token=${tokenB}&target=/`,
      middleware: [
        // devMiddleware,
        webpackDevMiddleware(bundler, {
          noInfo: true,
          quiet: false,
          publicPath: webpackConfig.output.publicPath,
          stats: webpackConfig.stats
        }),
        // bundler should be the same as above
        webpackHotMiddleware(bundler),
        (req, res, next) => {
          next()
          if (/logout/.test(req.url)) {
            runSequence('get-dev-token')
            gutil.log('Token expired. Copy url below to your browser or enter npm run dev-login to continue.')
            gutil.log(`https://localhost:3000/entry?token=${tokenB}&target=/`)
          }
        }
      ],
    },
    // no need to watch '*.js' here, webpack will take care of it for us,
    // including full page reloads if HMR won't work
    files: [
      'build/public/**/*.css',
      'build/public/**/*.html',
      'build/content/**/*.*',
      'build/templates/**/*.*'
    ]
  }, () => {
    // prevent dev server restarting during the initialization of browser-sync
    setTimeout(() => {
      bsInitialized = true
    }, 5000)
  })
})

gulp.task('initWebpack_default', (cb) => {
  gutil.log('init webpack..')
  env({
    vars: {
      NODE_ENV: 'development',
      IGNORE_KEY_FILE: true,
      backgroundpic: devServerEnv.backgroundpic,
    }
  })
  webpackConfig = require('./tools/webpack.config.babel.default')[0]
  bundler = webpack(webpackConfig, (err, stats) => {
    if (err) {
      throw err
    }
    gutil.log('webpack initialized done')
    cb()
  })
  bundler.plugin('done', () => {
    if (serverInitialized && bsInitialized) {
      setTimeout(() => {
        gutil.log('server restarting due to app codes changed....')
        nodemon.restart()
      }, 500)
    }
  })
})

gulp.task('initWebpack_ECK', (cb) => {
  gutil.log('init webpack..')
  env({
    vars: {
      NODE_ENV: 'development',
      IGNORE_KEY_FILE: true,
      backgroundpic: devServerEnv.backgroundpic,
    }
  })
  webpackConfig = require('./tools/webpack.config.babel.ECK')[0]
  bundler = webpack(webpackConfig, (err, stats) => {
    if (err) {
      throw err
    }
    gutil.log('webpack initialized done')
    cb()
  })
  bundler.plugin('done', () => {
    if (serverInitialized && bsInitialized) {
      setTimeout(() => {
        gutil.log('server restarting due to app codes changed....')
        nodemon.restart()
      }, 500)
    }
  })
})

gulp.task('dev-server', cb => {
  nodemon({
    exec: 'babel-node',
    // execMap: { js: 'node --debug' },
    // nodeArgs: ['--debug'],
    // nodemon our expressjs server
    script: 'src/server/server-preloader.js',
    ext: 'js',
    // watch core server file(s) that require server restart on change
    watch: ['src/server/**/*.*'],
    ignore: ['*.csv','*.pdf'],
    // watch: ['src/**/*.js'],
    env: devServerEnv,
    stdout: false // must be false so that we could catch the stdout/stderr to ensure when the server is ready
  }).on('stdout', event => {
    gutil.log(event.toString())
    if (!serverInitialized) {
      const rule = /Server listening at http:\//
      if (rule.test(event.toString())) {
        serverInitialized = true
        cb()
      }
    } else {
      if (/Access token is not valid/.test(event.toString())) {
        runSequence('get-dev-token')
        gutil.log('Token expired. Copy url below to your browser or enter npm run dev-login to continue.')
        gutil.log(`https://localhost:3000/entry?token=${tokenB}&target=/`)
      }
    }
  }).on('stderr', err => {
    gutil.log(gutil.colors.red(err.toString()))
  })
})

gulp.task('apidoc', done => {
  apidoc({
    src: 'src/server/api',
    dest: 'apidoc/',
    silent: false
  }, done)
})

gulp.task('watch-apidoc', ['apidoc'], () => gulp.watch('src/server/api/**/*.js', ['apidoc']))

gulp.task('set-env', () => {
  if (process.platform === 'win32') {
    // use custom config, otherwise fallbacks to /usr/local/ssl/openssl.cnf
    process.env.OPENSSL_CONF = path.join('tools', 'openssl', 'share', 'openssl.cnf')
    // use bundled openssl executable
    pem.config({
      pathOpenSSL: path.join('tools', 'openssl', 'bin', 'openssl.exe')
    })
  }
})

gulp.task('create-cert', (cb) => {
  pem.createCertificate({ days: 365, selfSigned: true }, (err, keys) => {
    if (err) {
      throw err
    }
    sslkeys = keys
    cb()
  })
})

gulp.task('generate-https-cert', ['set-env', 'create-cert'], () => {
  if (!sslkeys || !sslkeys.serviceKey || !sslkeys.certificate) {
    throw new Error('ssl keys not found!')
  }
  const key = source('domain.key')
  key.end(sslkeys.serviceKey)
  const crt = source('domain.crt')
  crt.end(sslkeys.certificate)
  return mergeStream(
    key.pipe(gulp.dest('./keys/')),
    crt.pipe(gulp.dest('./keys/'))
  )
})

gulp.task('generate-license-pwd', () => {
  try {
    const pwd = source('licensePwd')
    pwd.end(crypto.randomBytes(32))
    const hmacPwd = source('licenseHMACPwd')
    hmacPwd.end(crypto.randomBytes(32))

    return mergeStream(
      pwd.pipe(gulp.dest('./keys/')),
      hmacPwd.pipe(gulp.dest('./keys/'))
    )
  } catch (err) {
    throw err
  }
})

gulp.task('generate-jwt-keys', () => {
  try {
    const keys = keypair({ bits: 512 })
    const key_rsa = source('key_rsa')
    key_rsa.end(keys.private)

    const key_rsa_pub = source('key_rsa.pub')
    key_rsa_pub.end(keys.public)

    return mergeStream(
      key_rsa.pipe(gulp.dest('./keys/')),
      key_rsa_pub.pipe(gulp.dest('./keys/'))
    )
  } catch (err) {
    throw err
  }
})

gulp.task('maya-jwt-keys', () => {
  try {
    const auth_keys = keypair({ bits: 512 })
    const auth_key_rsa = source('maya_auth_key_rsa')
    auth_key_rsa.end(auth_keys.private)

    const auth_key_rsa_pub = source('maya_auth_key_rsa.pub')
    auth_key_rsa_pub.end(auth_keys.public)

    const access_keys = keypair({ bits: 512 })
    const access_key_rsa = source('maya_access_key_rsa')
    access_key_rsa.end(access_keys.private)

    const access_key_rsa_pub = source('maya_access_key_rsa.pub')
    access_key_rsa_pub.end(access_keys.public)

    return mergeStream(
      auth_key_rsa.pipe(gulp.dest('./keys/')),
      auth_key_rsa_pub.pipe(gulp.dest('./keys/')),
      access_key_rsa.pipe(gulp.dest('./keys/')),
      access_key_rsa_pub.pipe(gulp.dest('./keys/'))
    )
  } catch (err) {
    throw err
  }
})

gulp.task('get-dev-token', async () => {
  process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0
  const key = fs.readFileSync('keys/maya_auth_key_rsa', { encoding: 'utf-8' })
  const user = {
    id: 'whatever',
    loginTime: String(Date.now()),
    name: 'whatever',
    displayName: 'whatever',
    position: 'whatever',
    phone: 'whatever',
    email: 'whatever',
    scope: 'admin',
  }

  const tokenM = jwt.sign(user, key, { expiresIn: `${500 * 60 * 1000} ms`, algorithm: 'RS256' })
  await fetch(`https://localhost:${devServerEnv.port}/api/maya/auth/access-token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token: tokenM }),
  }).then((response) => {
    if (response.status >= 400) {
      throw new Error('Bad response from server')
    }

    return response.json()
  }).then((data) => {
    tokenB = data.accessToken
  })
})

gulp.task('open-tab', () => {
  gulp.src('')
  .pipe(open({ uri: `https://localhost:3000/entry?token=${tokenB}&target=/` }))
})

gulp.task('dev-login', () => {
  runSequence('get-dev-token', 'open-tab')
})

gulp.task('generate-dev-license', () => {
  const execSync = require('child_process').execSync
  const os = require('os')
  let command
  if(/^win/.test(os.platform())) {
    command = 'wmic csproduct get UUID'
  } else if (/^darwin/.test(os.platform())) {
    command = 'ioreg -rd1 -c IOPlatformExpertDevice | awk "/IOPlatformUUID/"'
  } else {
    command = 'dmidecode | grep -i uuid'
  }
  const uuidRule = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i
  const uuid = uuidRule.exec(String(execSync(command)))[0]
  const key = crypto.createHash('md5').update(uuid).digest('hex')
  const cipher = crypto.createCipher('aes-128-ecb', key)
  const devLicense = validLicenseInfo
  let encrypted = cipher.update(JSON.stringify(devLicense), 'utf8', 'base64')
  encrypted += cipher.final('base64')
  fs.writeFileSync('./keys/license.key', encrypted)
})
