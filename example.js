const config = require('./config')
const Braniac = require('./src/index')
const bot = new Braniac.Client(config, false)
const path = require('path')

bot.registerCommands(path.join(__dirname, 'cmd'))

bot.login(bot.config.token)

process.title = 'Braniac'
