const { cacheone } = require('../functions/trackInvites.js')

module.exports = {
    name: 'guildCreate',
    once: false,
    async execute (guild) {
        cacheone(guild)
}}