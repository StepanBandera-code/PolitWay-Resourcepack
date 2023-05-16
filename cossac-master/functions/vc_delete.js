module.exports = async function (member, channel, client) { 
    channel.delete() //Delete the channel itself
    delete client.privates[`${channel.guild.id}_${member.id}`] //Delete the set from client.privates
};