const log = require('../functions/log.js') //Require log function
const { QuickDB } = require('quick.db')
const db = new QuickDB()

module.exports = {
    name: 'guildMemberAdd',
    once: false,
    async execute (member, client) {
        if(member.bot) return;

        await log('memAdd', client, { member }) //Execute the function

        const autorole = db.table('rolemng')
        const pref = await autorole.get(`${member.guild.id}.autorole`)
        if(pref){
            const role = member.guild.roles.cache.get(pref)
            if(role){
                try{
                    member.roles.add(role)
                }catch(err){
                    console.error(err)
                }
            }
        }

        const restore = db.table('rrestore')

        const data = await restore.get(`${member.guild.id}.${member.id}`)
        if(!data) return;

        await restore.delete(`${member.guild.id}.${member.id}`)

        try{
            if(data.nickname) member.setNickname(data.nickname)
            if(data.roles){
                data.roles.forEach(r => {
                    const role = member.guild.roles.cache.get(r)
                    if(role) member.roles.add(role)
                });
            }
        }catch(err){
            console.error(err)
        }
}}