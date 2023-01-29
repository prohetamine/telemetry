const { io } = require('socket.io-client')
    , fs = require('fs')
    , path = require('path')
    , sleep = require('sleep-promise')

const syncRandom = array =>
  array.map(elem => [elem, Math.random()]).sort((a, b) => a[1] - b[1]).map(elem => elem[0])


const sites = [
  'Chaturbate',
  'xHamsterLive',
  'BongaCams',
  'Stripchat'
]

const usernames = {
  'Chaturbate': 'voltica',
  'xHamsterLive': 'voltica@xh',
  'BongaCams': 'voltica',
  'Stripchat': 'voltica'
}

;(async () => {
  const sockets = await Promise.all(
    sites.map(
      site =>
        new Promise(res => {
          const options = {
            options: {
              reconnectionDelayMax: 10000
            }
          }

          const socket = io(`http://localhost:6767?platform=${site}`, options)
          socket.on('connect', () => res({ site, socket }))
        })
    )
  )

  const data = syncRandom(
    sites.map(
      site => {
        const windowId = `10475-148-2${parseInt(Math.random() * 9)}${parseInt(Math.random() * 9)}${parseInt(Math.random() * 9)}${parseInt(Math.random() * 9)}`

        return JSON.parse(
          fs.readFileSync(path.join(__dirname, 'database', `${site}.json`)
          ,
          'utf8')
        )
        .map(event => ({ ...event, windowId }))
      }
    ).flat()
  )

  for (let i = 0; i < data.length; i++) {
    const socket = sockets.find(socket => socket.site === data[i].platform).socket

    const event = {
      ...data[i],
      id: i+1,
      modelUsername: usernames[data[i].platform],
      synthetic: true,
      localDate: (new Date() - 0) + (i * 1000)
    }

    socket.emit(
      'output',
      JSON.stringify(event)
    )

    console.log(`${data.length}/${i + 1}`)
    await sleep(1)
  }
})()
