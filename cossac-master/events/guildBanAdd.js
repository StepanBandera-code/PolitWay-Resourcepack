const log = require('../functions/log.js') //Require log function

module.exports = {
    name: 'guildBanRemove',
    once: false,
    async execute (guild, user, client) {
        await log('banRemove', client, { guild, user }) //Execute the function
}}