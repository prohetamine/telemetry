const fs = require('fs')
    , path = require('path')

const bongacams = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'database', 'BongaCams.json'), 'utf8'))

const normalizeBongaCams = bongacams.map(event => {
  return JSON.parse(event.data)
}).filter(e => e)


console.log(
  normalizeBongaCams
    .filter(e => e.type === 'ServerMessageEvent:TIP_MENU_CHANGE')
)

console.log(
  Object.keys(
    normalizeBongaCams.map(event => event.type).reduce((ctx, elem) => {
      ctx[elem] = true
      return ctx
    }, {})
  )
)
