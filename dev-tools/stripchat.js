const fs = require('fs')
    , path = require('path')

const xhamsterlive = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'database', 'Stripchat.json'), 'utf8'))

const normalizeXhamsterlive = xhamsterlive.map(event => {
  return JSON.parse(event.data)
  //return JSON.parse(event.data)
}).filter(e => e)


console.log(
  normalizeXhamsterlive
    .filter(e => e.subscriptionKey && e.subscriptionKey.match(/newPrivateMessageReceived/))
    .map(e => e.params)
)


console.log(
  Object.keys(
    normalizeXhamsterlive.map(event => event.subscriptionKey && event.subscriptionKey.replace(/:.+/, '')).reduce((ctx, elem) => {
      ctx[elem] = true
      return ctx
    }, {})
  )
)
