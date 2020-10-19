import LogoutBeta from 'server/api/maya/auth/logout-v1beta.js'
import co from 'co'


describe('[unit] logout v1 beta api & test jwt function', function() {
  let parameters = this
  const logoutBetaFunc = new LogoutBeta()

  it('request body have not token, it should be return "Unauthorized"', async () => {
    let tempParamet = {
      ...parameters,
      'cookies':{
        'set': function(){},
      },
    }
    co(logoutBetaFunc.jwt.apply(tempParamet)).then(() => {
      expect('log out successfully').toEqual(JSON.parse(tempParamet.body))
    })
  })
})
