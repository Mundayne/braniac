module.exports = {
  token: '', // Bot token goes here
  prefix: 'br!', // Can be anything (used as default if no server prefix specified)
  devs: ['216399535390326794'], // Mundane
  /*
  * Server configs
  */
  '12345678987': { // Server id
    prefix: 'br!', // Server command prefix (optional - by default uses prefix above)
    logChannel: 'log-channel-id', // Channel to log commands to
    roles: {
      admin: 'admin-role-id', // Admin role
      mod: 'mod-role-id', // Mod role
      trusted: 'trusted-role-id' // Trusted role
    },
    filters: { // Filter groups - includes an example
      serverLinks: { // Example filter group - filters discord server invites
        action: 'delete', // Can be 'delete' or 'warn' - see README for more info
        filters: [/(discord.gg)/g, /(discordapp.com)/g, /(discord.com)/g] // RegExp filters
      }
    },
    spamTime: 800
  }
}
