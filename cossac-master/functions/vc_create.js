const { PermissionsBitField, ChannelType } = require(`discord.js`)
const { QuickDB } = require(`quick.db`)
const db = new QuickDB().table("lobbies")

module.exports = async function (member, guild, client) { 

    let channel = await guild.channels.create({ //Creates a new channel
        name: member.nickname || member.user.username, //Nickname or username
        bitrate: 96 * 1000, //Max bitrate
        parent: guild.channels.cache.get(await db.get(guild.id)).parent || undefined, //If has perent set perent
        type: ChannelType.GuildVoice, //Type: Voice
        permissionOverwrites: [
            {
                id: guild.id,
                deny: [PermissionsBitField.Flags.ViewChannel], //Deny all the members
            },
            {
                id: member.id,
                allow: [PermissionsBitField.Flags.ViewChannel], //Allow channel creator
            },
        ],
      })

    member.voice.setChannel(channel).catch(O_o=>{}) //If member is in voice - set his vc to his new channel
    client.privates[`${guild.id}_${member.user.id}`] = channel.id //Set client.privates with guild's and member's id's
    return channel
};