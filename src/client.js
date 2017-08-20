const Discord = require('discord.js')
const Command = require('./command')
const Logger = require('./logger')
const Perms = require('./perms')
const Filter = require('./filter')
const reload = require('require-reload')(require)

/**
 * Handles commands, mutes and kicks.
 */
class BraniacClient extends Discord.Client {
  /**
   * Creates a new client instance.
   *
   * @param  {Object} config The config file to use with the bot.
   * @param  {Object} [options={}] Optional options for the discord client
   */
  constructor (config, selfbot, options = {}) {
    super(options)
    /**
     * The bot's config file.
     * @type {Object}
     */
    this.config = config
    /**
     * The logger of the client.
     * @type {Logger}
     */
    this.logger = new Logger(this)
    /**
     * All the commands registered to the bot.
     * @type {Discord.Collection}
     */
    this.commands = new Discord.Collection()
    /**
     * All the command groups registered to the bot.
     * @type {Discord.Collection}
     */
    this.groups = new Discord.Collection()

    this.on('ready', () => {
      this.logger.ready()
    })

    this.on('message', msg => {
      if (msg.author !== this.user && msg.guild) Filter(this, msg)

      if (msg.author.bot) return
      if (selfbot && msg.author === this.user) return

      let guild = msg.guild
      let gConfig = guild ? this.config : this.config[guild.id]
      let prefix = gConfig.prefix

      if (!msg.content.startsWith(prefix)) return

      this.handle(msg, prefix)
    })
  }

  /**
   * Handles incoming prefixed messages, sending them to the appropriate commands.
   * @see Braniac#Command
   *
   * @param  {Discord.Message} msg The incoming message.
   * @param {string} prefix This guild's prefix
   */
  handle (msg, prefix) {
    // The guild the msg was sent in
    let guild = msg.guild
    // The command
    let cmd = msg.content.split(' ')[0].substr(prefix.length)
    // The command object - get from name, or alias
    let command = this.commands.get(cmd) || this.commands.filter(comm =>
      comm.aliases.includes(cmd)
    ).first()

    // If the message isn't from a guild and the command isn't 'help', stop handling
    if (!guild && command.name !== 'help') return

    // Boolean: whether or not the command has no parameters
    let cmdOnly = msg.content === `${prefix}${cmd}`

    // If the command exists
    if (command) {
      // Check permission level
      if (!this.memberPerms(msg.member).includes(command.perms)) {
        return msg.reply(`you have insufficient permissions to do this.`)
          .catch(console.error)
      }

      // If the command has no parameters, but it requires them
      if (/<[\s\S]+>/g.test(command.usage) && cmdOnly) { return msg.reply('this command requires parameters.') }

      // Run and log the command
      command.run(this, msg)
      this.logger.log(msg)
    }
  }

  /**
   * Get
   *
   * @param {Discord.Member} member description
   * @returns {Array} An array of permission levels. @see Braniac#Perm
   */
  memberPerms (member) {
    // The guild the member belongs to
    let guild = member.guild

    let trustedRoleID
    let modRoleID
    let adminRoleID

    if (this.config[guild.id]) {
      // IDs of the permission level roles
      trustedRoleID = this.config[guild.id].roles.trusted
      modRoleID = this.config[guild.id].roles.mod
      adminRoleID = this.config[guild.id].roles.admin
    } else {
      trustedRoleID = 999
      modRoleID = 999
      adminRoleID = 999
    }
    let devs = this.config.devs

    // Perms the member has
    let mPerms = []
    // Add perm levels
    if (devs.includes(member.id)) {
      mPerms.push(Perms.dev)
    }
    if (member.roles.has(adminRoleID)) {
      mPerms.push(Perms.admin)
    }
    if (member.roles.has(modRoleID)) {
      mPerms.push(Perms.mod)
    }
    if (member.roles.has(trustedRoleID)) {
      mPerms.push(Perms.trusted)
    }
    mPerms.push(Perms.member)

    return mPerms
  }

  /**
   * Registers a command with the bot.
   *
   * @param  {(BraniacCommand|Function)} command The command to register.
   */
  registerCommand (command) {
    // If we get passed a constructor, instance it
    if (typeof command === 'function') command = new command(this) // eslint-disable-line

    // If the command isn't a command instance, don't register it
    if (!(command instanceof Command)) {
      this.emit('warn', `${command} is an invalid command object; skipping.`)
      return
    }

    // If a command with that name exists, throw
    if (this.commands.some(cmd => cmd.name === command.name || cmd.aliases.includes(command.name))) {
      throw new Error('A command with that name/alias already exists!')
    }

    // If a command with that alias exists, throw
    command.aliases.forEach(alias => {
      if (this.commands.some(cmd => cmd.name === alias || cmd.aliases.includes(alias))) {
        throw new Error('A command with that name/alias already exists!')
      }
    })

    // Add the command to the client
    this.commands.set(command.name, command)

    // Add the command to its group
    if (!this.groups.has(command.group)) {
      this.groups.set(command.group, [command])
    } else {
      let group = this.groups.get(command.group)
      group.push(command)
      this.groups.set(command.group, group)
    }
  }

  /**
   * Registers all commands in a directory.
   * @see BraniacClient#getCommands
   *
   * @param  {string} path The path to the folder to register commands from.
   */
  registerCommands (path) {
    // Get all the command objects
    let commands = this.getCommands(path)

    // Register all the commands
    for (let command of commands) {
      this.registerCommand(command)
    }
  }

  /**
   * Gets all commands in a directory.
   *
   * @param  {string} path The path to the folder to register commands from.
   * @returns {Array} All the command objects to register.
   */
  getCommands (path) {
    let commands = []
    // Get all the command groups
    let groups = require('require-all')(path)
    // Loop throught the group
    for (let group of Object.values(groups)) {
      // Loop through each command in the group
      for (let command of Object.values(group)) {
        // Add the command to the array
        commands.push(command)
      }
    }
    return commands
  }

  /**
   * Reloads, deletes, then registers a command.
   *
   * @param  {BraniacCommand} cmd The command to register.
   * @param  {string} path The path to the command.
   */
  reload (cmd, path) {
    // The reloaded command
    let command = reload(path)

    // Delete the command
    this.commands.delete(cmd.name)
    // Delete the command from it's group
    let group = this.groups.get(cmd.group)
    let index = group.indexOf(cmd)
    if (index >= 0) group.splice(index, 1)
    this.groups.set(cmd.group, group)

    // Re-register the command
    this.registerCommand(command)
  }
}
module.exports = BraniacClient
