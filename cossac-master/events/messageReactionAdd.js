module.exports = {
    name: 'messageReactionAdd',
    once: false,
    async execute (messageReaction, user, client) {
        if(messageReaction && messageReaction._emoji.name === "🇷🇺"){
            try{
                const guild = await client.guilds.fetch(messageReaction.message.guildId)
                const member = await guild.members.cache.get(user.id)

                await messageReaction.remove()
                messageReaction.message.react('🇺🇦')
                member.ban({ reason: 'Прапор рашки' })
                .catch(err => console.error(`Can't ban reaction author. Missing permissions?`))
            }catch(err){
                if(err) console.error(err)
            }
        }
}}