/**
 * A simple logger for commands and other utility stuff.
 */
class Logger {
  /**
   * Creates a new logger.
   *
   * @param {BraniacClient} client The bot client this is paired to.
   */
  constructor (client) {
    this.client = client
    this.config = this.client.config
  }

  /**
   * Logs a bot ready statement to the console.
   */
  ready () {
    console.log(`Ready to serve in ${this.client.channels.size} channels on \
${this.client.guilds.size} servers, for a total of ${this.client.users.size} users.`)
  }

  /**
   * Logs a command.
   *
   * @param  {Discord.Message} cmd The command to log.
   */
  log (cmd) {
    if (!cmd.guild) return
    if (!this.config[cmd.guild.id]) return
    let chn = cmd.guild.channels.get(this.config[cmd.guild.id].logChannel)
    chn.send(`\`\`\`\n
= ${cmd.createdAt.toString().substr(0, 24)} =\n
${cmd.author.username} (${cmd.author.id}):\n
-----------------------------\n
${cmd.cleanContent}\n
\`\`\``)
  }
}
module.exports = Logger

// @TODO: ensure that proper args passed to log()
// @TODO: support logging levels
