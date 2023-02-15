const fs                    = require('fs')
    , path                  = require('path')
    , jsonfile              = require('jsonfile')
    , AppChannel            = require('node-mermaid/store/app-channel')()
    , AppTransportChannel   = require('node-mermaid/store/app-transport-channel')()
    , appMemoryFolderPath   = require('node-mermaid/store/app-memory-folder-path')

AppChannel.on('connect', () => {
  AppTransportChannel.on('connect', () => {
    const basePath = path.join(appMemoryFolderPath, 'database')

    if (!fs.existsSync(basePath)) {
      fs.mkdirSync(basePath)
    }

    AppChannel.on('data', data => {
      AppTransportChannel.writeData({
        type: 'message'
      })

      if (data.synthetic) {
        return
      }

      const fileName = `${data.platform}.json`
          , filePath = path.join(basePath, fileName)

      try {
        const array = JSON.parse(fs.readFileSync(filePath, 'utf8'))
        jsonfile.writeFileSync(filePath, [data, ...array], { spaces: 2 })
      } catch (e) {
        jsonfile.writeFileSync(filePath, [data], { spaces: 2 })
      }
    })

    AppChannel.on('reload', () => {
      AppTransportChannel.writeData({
        type: 'reload'
      })
    })
  })
})
