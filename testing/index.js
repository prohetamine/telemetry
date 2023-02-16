const { io }                = require('socket.io-client')
    , appData               = require('app-data-folder')
    , fs                    = require('fs')
    , path                  = require('path')
    , sleep                 = require('sleep-promise')
    , term                  = require('terminal-kit').terminal

const syncRandom = array =>
  array.map(elem => [elem, Math.random()]).sort((a, b) => a[1] - b[1]).map(elem => elem[0])

const [repository, app] = process.argv.slice(2)

const basePath = appData('MermaidStoreData')
    , databasePath = path.join(basePath, 'memory', repository, app, 'database')

term.fullscreen()
term.on('key', key => {
  if (key === 'CTRL_C') {
    term.red('\nCancel')
    process.exit()
  }
})

const selectingSites = items => {
  term.cyan('Which sites should be involved in testing,\n')
  term.cyan('you can choose several options\n')
  term.cyan('------')

  return new Promise(res => {
    term.singleColumnMenu(
      items,
      {
        style: term.green
      },
      async (error, response) => {
    	   res(response.selectedText)
      }
    )
    term.moveTo(0, items.length + 4).cyan('------')
  })
}

const test = async () => {
  const _sites = fs.readdirSync(databasePath)
                  .filter(f => f.match(/\.json$/))
                  .map(f => f.replace(/\.json$/, ''))

  let sites = _sites
    , modelUsernames = {}

  for (;sites.length !== 0;) {
    term.reset()
    const site = await selectingSites([...sites, '[ALL]', '[EXIT]'])

    if (site === '[ALL]') {
      term.reset()
      sites = []
      break
    }

    if (site === '[EXIT]') {
      term.reset()
      break
    }

    sites = sites.filter(_site => _site !== site)
  }

  sites = _sites.filter(_site => !sites.find(site => site === _site))

  if (sites.length === 0) {
    term.red('Not sites selected\n')
    process.exit()
  }

  term.cyan(`Selected sites:\n`)
  term.cyan('------\n')
  for (let i = 0; i < sites.length; i++) {
    term.cyan(`#${(i + 1)}`).green(` ${sites[i]}\n`)
  }
  term.cyan('------')

  for (let i = 0; i < sites.length; i++) {
    term.cyan(`\nModel username for ${sites[i]}: `)
    const modelUsername = await new Promise(res => {
      term.inputField((error, input) => {
      	res(input)
      })
    })

    modelUsernames[sites[i]] = modelUsername
  }

  term.cyan('\n------\n')

  term.cyan(`Interval event (ms): `)
  const interval = parseInt(
      await new Promise(res => {
      term.inputField((error, input) => {
        res(input)
      })
    })
  )

  term.cyan('\n------\n')

  term.green(`Create WebSockets ... \n`)

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
          socket.on('connect', () => {
            term.green(`Connect WebSocket to: ${site}\n`)
            res({ site, socket })
          })
        })
    )
  )

  term.green(`Create data ...\n`)

  const data = syncRandom(
    sites.map(
      site => {
        const windowId = `10475-148-2${parseInt(Math.random() * 9)}${parseInt(Math.random() * 9)}${parseInt(Math.random() * 9)}${parseInt(Math.random() * 9)}`

        return JSON.parse(
          fs.readFileSync(path.join(databasePath, `${site}.json`)
          ,
          'utf8')
        )
        .map(event => ({ ...event, windowId }))
      }
    ).flat()
  )

  term.green(`Create complete data\n`)

  term.cyan('------\n\n')

  term.cyan('Start chat? Enter/Ctrl + C\n\n')
  const isStart = await new Promise(res =>
    term.yesOrNo({ yes: ['ENTER'], no: ['n'] }, (error, result) => res(result))
  )

  if (isStart) {
    for (let i = 0; i < data.length; i++) {
      const socket = sockets.find(socket => socket.site === data[i].platform).socket

      const event = {
        ...data[i],
        id: i+1,
        modelUsername: modelUsernames[data[i].platform],
        synthetic: true,
        localDate: (new Date() - 0) + (i * 1000)
      }

      socket.emit(
        'output',
        JSON.stringify(event)
      )

      term.magenta(`${i + 1}/${data.length}`).gray(' | ').cyan(event.platform).gray(' to ').cyan(`${event.modelUsername}\n`)
      await sleep(interval)
    }
    term.green(`\nAll data sent.\n`)
    term.cyan('Repeat chat? Enter/n\n')
    const isRestart = await new Promise(res =>
      term.yesOrNo({ yes: ['ENTER'], no: ['n'] }, (error, result) => res(result))
    )

    if (!isRestart) {
      process.exit()
    } else {
      term.reset()
      term.clear()
      test()
    }
  }
}

test()
