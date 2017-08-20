const Braniac = require('../../src/index')

class Test extends Braniac.Command {
  constructor (client) {
    super(client, {
      name: 'test',
      displayName: 'test',
      aliases: ['!'],
      group: 'test',
      description: 'A test command.',
      info: 'Does a thing.',
      usage: '[redundant]',
      perms: Braniac.Perms.member
    })
  }

  run (bot, message) {
    message.reply('pong!').then(msg => {
      msg.delete(5000)
    }).catch(console.error)
  }
}
module.exports = Test
