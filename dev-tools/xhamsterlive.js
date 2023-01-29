const fs = require('fs')
    , path = require('path')

const xhamsterlive = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'database', 'xHamsterLive.json'), 'utf8'))

const normalizeXhamsterlive = xhamsterlive.map(event => {
  return JSON.parse(event.data)
  //return JSON.parse(event.data)
}).filter(e => e)


console.log(
  normalizeXhamsterlive
    .filter(e => e.subscriptionKey && e.subscriptionKey.match(/newChatMessage/))
    .filter(e => e.params.message.type === 'privateTip')
    .map(e => e.params.message)
)

console.log(
  Object.keys(
    normalizeXhamsterlive
      .filter(e => e.subscriptionKey && e.subscriptionKey.match(/newChatMessage/))
      .map(e => e.params.message.type)
      .reduce((ctx, elem) => {
        ctx[elem] = true
        return ctx
      }, {})
  )
)


console.log(
  Object.keys(
    normalizeXhamsterlive.map(event => event.subscriptionKey && event.subscriptionKey.replace(/:.+/, '')).reduce((ctx, elem) => {
      ctx[elem] = true
      return ctx
    }, {})
  )
)
