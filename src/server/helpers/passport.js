import { Strategy as LocalStrategy } from 'passport-local'
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt'
import co from 'co'
import authenticate, { RES_CODE_SUCCESS, RES_CODE_FAILED } from '../utils/free-radius'
import { COOKIE_AUTH_TOKEN } from './server-auth-helper'
import { errorCode, throwApiError } from './api-error-helper'
import { findUser, recordUser } from 'server/helpers/user-id-helper'
import passport from 'koa-passport'
const { maya } = global.config

export default class Passport {
  static get loginStrategy() {
    return new LocalStrategy({ session: false }, (username, password, done) => {
      co(function* () {
        try {
          const response = yield authenticate(username, password)
          const authenticated = response.code === RES_CODE_SUCCESS
          if (!authenticated) {
            return done(null, false, 'incorrect usernam or password')
          }

          const [role, id, name, displayName, position, phone, email] = response.attributes['Reply-Message']
          let scope = []
          role === 'admin' && (scope = scope.concat(['admin', 'doctor']))
          role === 'doctor' && scope.push('doctor')
          yield recordUser(id)
          done(null, { id, name, displayName, position, phone, email, scope })

        } catch (ex) {
          done(ex)
        }

      })
    })
  }

  static _jwtStrategy(ignoreExpiration = false) {
    const options = {
      secretOrKey: global.config.publicKey,
      jwtFromRequest: (req) => {
        const rule = /^Bearer\s(.+)$/
        let token = null
        if (req && req.cookies && req.cookies.get(COOKIE_AUTH_TOKEN)) {
          token = req.cookies.get(COOKIE_AUTH_TOKEN)
        } else if (rule.test(req.get('Authorization'))) {
          token = rule.exec(req.get('Authorization'))[1]
        }
        // console.log('jwt toekn ', token)
        return token
      },
      algorithms: ['RS256', 'HS256'],
      ignoreExpiration: ignoreExpiration,
    }

    return new JwtStrategy(options, (payload, done) => {
      if (!payload) {
        done(null, false, 'Unauthenticated')
        return
      }
      const now = Date.now()
      const { jti, exp, scope, ...jwtObj } = payload
      const user = {
        ...jwtObj,
        isAuthenticated: exp * 1000 > now,
        expiresIn: exp * 1000,
        tokenValid: true,
        tokenExpired: exp * 1000 <= now,
        scope: scope,
        jti,
      }
      if (!maya.develop) {
        findUser(user.id, user.loginTime).then(res => {
          if(res == false) {
            done(null, false, 'Unauthenticated')
            return
          }
        })
      }
      done(null, user)
    })
  }

  static get appStrategy() {
    return Passport._jwtStrategy(true)
  }

  static get apiStrategy() {
    return Passport._jwtStrategy(false)
  }

  static allow = (...permissions) => function* (next) {
    if (!permissions) {
      yield next
    }

    const ctx = this
    yield passport.authenticate('api', { session: false }, function* (err, user, info) {
      if (err) {
        ctx.throw(err)
        return
      }

      if (user === false) {
        throwApiError('Access token is not valid', errorCode.UNAUTHORIZED)
        return
      }

      ctx.state.user = user

      if (user.scope.indexOf('admin') >= 0) {
        yield next
        return
      }

      for (let permission of permissions) {
        if (user.scope.indexOf(permission) >= 0) {
          yield next
          return
        }
      }

      throwApiError('Access token is not valid', errorCode.UNAUTHORIZED)
    }).call(this, next)

  };

  /**
   * the relative permissions foe a specific page, if null => no permission, everyone could visit
   * @param  {[type]} path [description]
   * @return {[type]}      [description]
   */
  static getPagePermissions(path) {
    let permissions = null
    if (/^\/admin/i.test(path)) {
      permissions = ['admin']
    }
    return permissions
  }
}

