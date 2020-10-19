import Root from 'containers/Root'

if (typeof require.ensure !== 'function') require.ensure = (d, c) => c(require)

/**
 * for debug in development env, require will be implemented in different way according to the environment.
 * @param  {[type]} component [description]
 * @return {[type]}           [description]
 */
// const requireComponent = (component) => {
//   if (!__DEV__) {
//     return (_, callback) => callback(null, require('../../containers/' + component))
//   } else {
//     return (_, callback) => require.ensure([], (require) => callback(null, require('../../containers/' + component)))
//   }
// }

const copyrightRoutes = {
  path: 'copyright',
  getComponent: (_, callback) => {
    require.ensure([], require => {
      callback(null, require('containers/Person/Copyright'))
    })
  },
}

const profileRoutes = {
  getComponent: (_, callback) => {
    require.ensure([], require => {
      callback(null, require('containers/Person/Profile'))
    })
  },
}

const personRoutes = {
  path: 'profile',
  getComponent: (_, callback) => {
    require.ensure([], require => {
      callback(null, require('containers/Person'))
    })
  },
  getIndexRoute: (_, callback) => {
    callback(null, profileRoutes)
  },
  getChildRoutes: (location, callback) => {
    callback(null, [
      copyrightRoutes,
    ])
  },
}

const adminSettingRoutes = {
  path: 'settings',
  getComponent: (_, callback) => {
    require.ensure([], require => {
      callback(null, require('containers/Admin/Settings').default)
    })
  },
}

const adminAboutRoutes = {
  path: 'about',
  getComponent: (_, callback) => {
    require.ensure([], require => {
      callback(null, require('containers/Admin/About').default)
    })
  },
}

const adminRoutes = {
  path: 'admin',
  indexRoute: {
    onEnter: (_, replace) => {
      replace({ pathname: '/admin/settings' })
    },
  },
  getComponent: (_, callback) => {
    require.ensure([], require => {
      callback(null, require('containers/Admin').default)
    })
  },
  getChildRoutes: (location, callback) => {
    callback(null, [
      adminSettingRoutes,
      adminAboutRoutes,
    ])
  },
}

const dashboardRoutes = {
  path: 'dashboard/:record',
  getComponent: (_, callback) => {
    require.ensure([], require => {
      callback(null, require('containers/Dashboard').default)
    })
  },
}

const recordRoutes = {
  path: 'record(/:record)',
  getComponent: (_, callback) => {
    require.ensure([], require => {
      callback(null, require('containers/Record').default)
    })
  },
}

const examinationRoutes = {
  path: 'examination/:record',
  getComponent: (_, callback) => {
    require.ensure([], require => {
      callback(null, require('containers/Examination').default)
    })
  },
}

const riskRoutes = {
  path: 'risk/:record',
  getComponent: (_, callback) => {
    require.ensure([], require => {
      callback(null, require('containers/Risk').default)
    })
  },
}

const patientRoutes = {
  path: 'patient/:p_id',
  indexRoute: {
    onEnter: (_, replace) => replace({ pathname: '/overview' }),
  },
  getChildRoutes: (_, callback) => {
    callback(null, [
      dashboardRoutes,
      recordRoutes,
      examinationRoutes,
      riskRoutes,
    ])
  },
}

const loginRoutes = {
  path: 'login',
  getComponent: (_, callback) => {
    require.ensure([], require => {
      callback(null, require('containers/Login').default)
    })
  },
}

const overviewIndexRoutes = {
  getComponent: (_, callback) => {
    require.ensure([], require => {
      callback(null, require('containers/Patient/Overview').default)
    })
  },
}

const searchRoutes = {
  path: 'search',
  getComponent: (_, callback) => {
    require.ensure([], require => {
      callback(null, require('containers/Patient/Search').default)
    })
  },
}

const overviewRoutes = {
  path: 'overview',
  getComponent: (_, callback) => {
    require.ensure([], require => {
      callback(null, require('containers/Patient'))
    })
  },
  getIndexRoute: (_, callback) => callback(null, overviewIndexRoutes),
  getChildRoutes: (location, callback) => {
    callback(null, [
      searchRoutes,
    ])
  },
}

const effectiveRoutes = {
  path: 'effective',
  getComponent: (_, callback) => {
    require.ensure([], require => {
      callback(null, require('containers/Effective').default)
    })
  },
}

const notFound = {
  path: '*',
  getComponent: (_, callback) => {
    require.ensure([], require => {
      callback(null, require('containers/NotFound'))
    })
  },
}

const unauthorized = {
  path: 'unauthorized',
  getComponent: (_, callback) => {
    require.ensure([], require => {
      callback(null, require('containers/Unauthorized'))
    })
  },
}

const licenseExpired = {
  path: 'license-expired',
  getComponent: (_, callback) => {
    require.ensure([], require => {
      callback(null, require('containers/LicenseExpired'))
    })
  },
}

const logoutSuccess = {
  path: 'logout-success',
  getComponent: (_, callback) => {
    require.ensure([], require => {
      callback(null, require('containers/LogoutSuccess'))
    })
  },
}

const homeRoutes = {
  path: '/',
  getComponent: (_, callback) => {
    require.ensure([], require => {
      callback(null, require('containers/Home'))
    })
  },
  indexRoute: {
    onEnter: (_, replace) => replace({ pathname: '/overview' }),
  },
  getChildRoutes: (_, callback) => {
    callback(null, [
      personRoutes,
      adminRoutes,
      overviewRoutes,
      patientRoutes,
      effectiveRoutes,
    ])
  },
}

export default {
  component: Root,
  getChildRoutes: (_, callback) => {
    require.ensure([], require => {
      callback(null, [
        homeRoutes,
        logoutSuccess,
        // loginRoutes,
        notFound,
        unauthorized,
        licenseExpired,
      ])
    })
  },
}
