const fs = require('fs')
    , path = require('path')

const chaturbate = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'database', 'Chaturbate.json'), 'utf8'))

const normalizeChaturbate = chaturbate.map(event => {
  try {
    return ({
      ...event,
      data: JSON.parse(event.data[0].data)
    })
  } catch (e) {
    try {
      return ({
        ...event,
        data: JSON.parse(event.data[0])
      })
    } catch (e) {}
  }

  return null
}).filter(e => e)

console.log(
  normalizeChaturbate
    .filter(e => e.data.method === 'connect')
    .map(e => e.data)
)

console.log(
  Object.keys(
    normalizeChaturbate.map(event => event.data.method).reduce((ctx, elem) => {
      ctx[elem] = true
      return ctx
    }, {})
  )
)
