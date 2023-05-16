const allInvites = new Map()

const cache = async(client) => {
    client.guilds.cache.forEach(guild => {
        guild.invites.fetch()
            .then(invites => {
                const codeUses = new Map();
                invites.each(inv => codeUses.set(inv.code, inv.uses));

                allInvites.set(guild.id, codeUses);
            })
            .catch(err => {
                console.error("Error caching invites: ", err.message)
            })
    })
}

const track = async(member) => {
    const cachedInvites = allInvites.get(member.guild.id)
    const newInvites = await member.guild.invites.fetch();
    try {
        const usedInvite = newInvites.find(inv => cachedInvites.get(inv.code) < inv.uses);
        return usedInvite;
    } catch (err) {
        console.error("Error while tracking invites: ", err)
    }

    newInvites.each(inv => cachedInvites.set(inv.code, inv.uses));
    guildInvites.set(member.guild.id, cachedInvites);
}

const update = async(invite) => {
    const invites = await invite.guild.invites.fetch();

    const codeUses = new Map();
    invites.each(inv => codeUses.set(inv.code, inv.uses));

    allInvites.set(invite.guild.id, codeUses);
}

const cacheone = (guild) => {
    guild.invites.fetch()
    .then(invites => {
        const codeUses = new Map();
        invites.each(inv => codeUses.set(inv.code, inv.uses));

        allInvites.set(guild.id, codeUses);
    })
    .catch(err => {
        console.error("Error caching invites: ", err.message)
    })
}

module.exports = {
    cache: cache,
    track: track,
    update: update,
    cacheone: cacheone
};