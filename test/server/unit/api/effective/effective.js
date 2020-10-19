import Effective from 'server/api/maya/effective/effective.js'
import Protos from 'common/protos'
import co from 'co'

describe('[unit] Effective api & test fetchList function', function() {
  let parameters = this
  const effectiveFunc = new Effective()
  const returnObject = {
    year: [],
  }
  const models = {
    getList: function* getList() {
      return returnObject
    },
  }
  it('it should be return object', async () => {
    let tempParamet = {
      ...parameters,
      'params':{},
      models,
    }

    co(effectiveFunc.fetchList.apply(tempParamet))
    .then(() => {
      const expectBuffer = Protos.EffectiveList.response.encode(returnObject).toBuffer()
      expect(tempParamet.body).toEqual(expectBuffer)
    })
  })

  it('should import Effective model when this.model does not exist.', async () => {
    let tempParamet = {
      ...parameters,
      'params':{},
    }
    const genThis = function () {
      return tempParamet
    }

    co(effectiveFunc.fetchList.apply(genThis())).then(successHandler, errorHnadler)
  })
})

describe('[unit] Effective api & test fetchPDF function', function() {
  let parameters = this
  const effectiveFunc = new Effective()
  const models = {
    getPDF: function* getPDF(year) {
      return 'returnPDF'
    },

  }
  it('it should be return object', async () => {
    let tempParamet = {
      ...parameters,
      'params': {
        'year': '2017',
        'lang': 'en',
      },
      models,
      attachment: function() {
        return true
      },
    }

    co(effectiveFunc.fetchPDF.apply(tempParamet))
    .then(() => {
      expect(tempParamet.body).toEqual('returnPDF')
    })
  })

  it('input number, it should be return object', async () => {

    let tempParamet = {
      ...parameters,
      'params': {
        'year': '2017',
        'lang': 'en',
      },
      models,
      attachment: function() {
        return true
      },
    }
    co(effectiveFunc.fetchPDF.apply(tempParamet))
    .then(() => {
      expect(tempParamet.body).toEqual('returnPDF')
    })
  })

  it('should import Accuracy model when this.model does not exist.', async () => {
    let tempParamet = {
      ...parameters,
      'params': {
        'year': '2017',
        'lang': 'en',
      },
      attachment: function() {
        return true
      },
    }
    const genThis = function () {
      return tempParamet
    }

    co(effectiveFunc.fetchPDF.apply(genThis())).then(successHandler, errorHnadler)
  })
})

const successHandler = function() {
}
const errorHnadler = function(err) {
  console.warn(err)
}
