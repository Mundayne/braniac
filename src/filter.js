// user msg cache
let spamCache = {}

/**
 * Filter - Filters messages recieved by the bot. Filters can be set in {@link bot#config config.js}. Also filters spam messages.
 *
 * @param  {BraniacClient} bot The bot client.
 * @param  {Discord.Message} msg The message to filter.
 */
module.exports = function (bot, msg) {
  if (!bot.config[msg.guild.id]) return
  // messages to delete
  let delCache = []
  // get useful info
  let author = msg.author
  let content = msg.content.toLowerCase()
  let createdTimestamp = msg.createdTimestamp
  /*
  *
  * Filter messages
  *
  */
  // Filters in the config
  let filterGroups = bot.config[msg.guild.id].filters
  // Loop through filter groups
  Object.values(filterGroups).forEach(filterGroup => {
    // Loop through filters
    filterGroup.filters.forEach(rawFilter => {
      // If the filter isn't a RegExp object/literal, make it one
      let filter = typeof rawFilter === 'object'
        ? new RegExp(rawFilter, 'g')
        : rawFilter
      // Get results of matches
      let results = filter.exec(content)
      // Skip to the next filter if this one isn't triggered
      if (!results) return

      // Perform the preset action
      switch (filterGroup.action) {
        case 'warn':
          // Warn the user, and delete the warning after 10 seconds
          msg.reply('your message triggered a filter. Be careful...')
            .then(m => m.delete(10000).catch(console.error))
            .catch(console.error)
          break

        case 'delete':
          // Cache the message to be deleted
          if (!delCache.includes(msg)) delCache.push(msg)
          break

        default:
      }
    })
  })
  /*
  *
  * Spam
  *
  */
  // The interval between messages to count as spam (in ms)
  let spamTime = bot.config[msg.guild.id].spamTime
  // The time between this message and the user's last (-999 if first)
  let time = spamCache[author.id] ? createdTimestamp - spamCache[author.id] : -999

  // If the message is spam
  if (time !== -999 && time <= spamTime) {
    // Cache the message to be deleted
    if (!delCache.includes(msg)) delCache.push(msg)
  }
  // Set the user's updated last message time
  spamCache[author.id] = createdTimestamp
  /*
  *
  * Delete
  *
  */
  // Delete every message in the cache, with a pause cos ratelimits
  delCache.forEach(message => {
    setTimeout(() => {
      message.delete().catch(console.error)
    }, 50)
  })
}
