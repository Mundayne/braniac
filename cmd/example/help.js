const Braniac = require('../../src/index')
const Discord = require('discord.js')

class Help extends Braniac.Command {
  constructor (client) {
    super(client, {
      name: 'help',
      displayName: '',
      aliases: ['?', 'helpme', 'aah'],
      group: 'util',
      description: 'Sends a help DM.',
      info: 'Sends a help DM containing information for each command.',
      usage: '[command]',
      perms: Braniac.Perms.member
    })
  }

  run (bot, msg) {
    let cmd = this.paramify(msg)[0]
    let helpMsg

    if (cmd) {
      let command = this.client.commands.get(cmd) || this.client.commands.filter(comm =>
        comm.aliases.includes(cmd)
      ).first()

      let groups = bot.groups

      if (command) {
        helpMsg = command.help(msg)
      } else if (groups && groups.has(cmd)) {
        helpMsg = groupHelp(bot, groups.get(cmd), cmd, msg.guild ? msg.guild.id : null)
      } else {
        return msg.reply(`${cmd} is not a command.`)
      }
    } else {
      helpMsg = helpMenu(bot, msg.guild ? msg.guild.id : null)
    }

    if (helpMsg) {
      msg.author.send({embed: helpMsg})
      .then(() => { if (msg.guild) msg.react('📬').catch(console.error) })
      .catch(console.error)
    }
  }
}
module.exports = Help

function helpMenu (bot, gID) {
  gID = gID || 999
  let gConf = bot.config[gID] || bot.config
  let prefix = gConf.prefix

  let message = new Discord.RichEmbed()

  message.setColor(require('randomcolor')())
  message.setAuthor(`Help for Braniac commands`, bot.user.avatarURL)
  message.setDescription(`Below is a list of each command group with each \
group's commands. Do \`${prefix}help [command/group]\` for more specific help.`)

  bot.groups.forEach(grp => {
    let cmdNames = grp.map(cmd => cmd.displayName)
    message.addField(`**${grp[0].group}**`, cmdNames.join(', '))
  })

  return message
}

function groupHelp (bot, group, cmd, gID) {
  gID = gID || 999
  let gConf = bot.config[gID] || bot.config
  let prefix = gConf.prefix

  let message = new Discord.RichEmbed()

  message.setColor(require('randomcolor')())
  message.setAuthor(`Help for the "${cmd}" group`, bot.user.avatarURL)
  message.setDescription(`Below is a list of each command in this group, \
do \`${prefix}help [command]\` for more specific help.`)

  if (group) {
    group.forEach(cmd => {
      message.addField(`**${cmd.displayName}**`, `${cmd.description}`)
    })
  } else {
    message.setDescription(`Group ${cmd} has no commands.`)
  }

  return message
}
