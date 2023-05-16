const log = require('../functions/log.js') //Require log function
const { QuickDB } = require('quick.db')
const db = new QuickDB()

module.exports = {
    name: 'guildMemberRemove',
    once: false,
    async execute (member, client) {
        if(member.bot) return;

        await log('memRemove', client, { member }) //Execute the function

        const prefdb = db.table('rolemng')
        const pref = await prefdb.get(`${member.guild.id}.restore`)
        if(!pref) return;

        const resdb = db.table('rrestore')
        await resdb.set(`${member.guild.id}.${member.id}`, {
            expire: Date.now() + 60 * 60 * 24 * 7,
            roles: member.roles.cache.map(role => role.id).filter(role => role !== member.guild.id) || [],
            nickname: member.nickname || null
        })
}}