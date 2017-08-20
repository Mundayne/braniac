const Discord = require('discord.js')
const Perms = require('./perms')

/**
 * Is a command.
 * @abstract
 */
class BraniacCommand {
  /**
   * Creates a new command object.
   *
   * @param {BraniacClient} client The bot client.
   * @param  {Object} info Information about the command.
   */
  constructor (client, info) {
    /**
     * The bot.
     * @type {Braniac.Client}
     */
    this.client = client
    /**
     * The command name. Unique.
     * @type {String}
     */
    this.name = info.name
    /**
     * The display name for the command. Shows up in help.
     * @type {String}
     */
    this.displayName = info.displayName || this.name
    /**
     * The aliases of the command.
     * @type {Array.<String>}
     */
    this.aliases = info.aliases || []
    /**
     * The group the command belongs to.
     * @type {String}
     */
    this.group = info.group || 'general'
    /**
     * A general description of the command.
     * @type {String}
     */
    this.description = info.description
    /**
     * Detailed information on the command.
     * @type {?String}
     */
    this.info = info.info || null
    /**
     * Usage for the command.
     * @type {?String}
     */
    this.usage = info.usage || null
    /**
     * The permission level needed to run the command.
     * @type {Perms}
     */
    this.perms = info.perms || Perms.member
  }

  /**
   * Runs the command.
   *
   * @param  {BraniacClient} bot The bot.
   * @param  {Discord.Message} msg The message calling the command.
   */
  run (bot, msg) {

  }

  /**
   * Returns a help embed for the command.
   *
   * @param  {Discord.Message} msg The message calling the help command.
   * @returns {Discord.RichEmbed} An embed containing the command's help.
   */
  help (msg) {
    // Get the prefix for this guild
    let gID = msg.guild ? msg.guild.id : 999
    let gConf = this.client.config[gID] || this.client.config
    let prefix = gConf.prefix

    // Create an embed containing all the command's information
    let helpEmbed = new Discord.RichEmbed()
    helpEmbed.setAuthor(`Help for ${this.displayName}`, this.client.user.avatarURL)
    helpEmbed.setDescription(this.description)
    helpEmbed.addField('Usage',
      `${prefix}${this.name} ${this.usage}`)
    helpEmbed.addField('Info', this.info)
    helpEmbed.addField('Group', this.group)
    helpEmbed.addField('Permission Level', this.perms)
    let aliases = this.aliases.join(', ')
    if (aliases) helpEmbed.addField('Aliases', aliases)
    helpEmbed.setColor(require('randomcolor')())

    return helpEmbed
  }

  /**
   * Convert message content to a parameter array.
   *
   * @param  {Discord.Message} msg The message whose content to convert.
   * @returns {Array.<String>} An array of parameters in the message.
   */
  paramify (msg) {
    // Split at any amount of any whitespace
    let rawParams = msg.content.split(/\s+/g)
    // Remove the command itself
    rawParams.shift()
    return rawParams
  }
}
module.exports = BraniacCommand
