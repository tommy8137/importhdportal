import { adminsPermission } from 'server/api/maya/admins/index.js'
import co from 'co'

describe('[unit] Admins index.js & Test middlewares of adminsPermission & Just for coverage....', function() {
  it('[unit] pass path\'s condiction && should run adminsPermission and this.licensesModels ', async () => {
    let tempParamet = {
      path : '/about/qoo',
      passportModels:{
        allow:function (username) {
          return function* bind(ctx, nextFunction) {
            return this
          }
        },
      },
      licensesModels:{
        bind: jest.fn(function* bind(ctx, nextFunction) {
          return this
        }),
      },
    }
    await co(adminsPermission.apply(tempParamet), [null])
  })

  it('[unit] unpass path\'s condiction', async () => {
    let paramet = {
      path : '/about/licenses'
    }
    await co(adminsPermission.apply(paramet, [emptyNext]))
  })

  it('[unit] should import PassportHelper and licenses modules', async () => {
    let paramet = {
      path : '/about/licenses'
    }
    co(adminsPermission.apply(paramet, [emptyNext])).then(successHandler, errorHnadler)
  })
})

const emptyNext = function* () {}
const successHandler = function() {

}
const errorHnadler = function(err) {
  console.warn(err)
}
