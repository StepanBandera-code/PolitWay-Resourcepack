const log = require('../functions/log.js') //Require log function

module.exports = {
    name: 'guildBanAdd',
    once: false,
    async execute (guild, user, client) {
        await log('banAdd', client, { guild, user }) //Execute the function
}}