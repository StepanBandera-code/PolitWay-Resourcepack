const { QuickDB } = require(`quick.db`)
const db = new QuickDB()

module.exports = async function (client) {
    const database = await db.table(`counters`).all() //Requires a table from db called 'counters'
    for (let i in database){ //Loops throught every value at db

        let guild = await client.guilds.cache.get(database[i].id) //Gets a guild from value
        if(!guild){
            console.error(`Remove ${database[i].id} from DB, because I cant see it.`)
            const raw = await db.table(`counters`)
            await raw.delete(database[i].id) //If guild wasn't found - delete value from db
            return;
        }

        let channel = await guild.channels.cache.get(database[i].value.id) //Gets a channel from value
        if(!channel){
            console.error(`Remove ${database[i].id} from DB, because I cant see it's channel`)
            const raw = await db.table(`counters`)
            await raw.delete(database[i].id) //If channel wasn't found - delete value from db
            return;
        }
        
        try{
            const online = await getOnline(guild)
            const members = await getMembers(guild)
            let name = database[i].value.name //Defines a name
            .replaceAll(`ON`, online)
                .replaceAll(`(ОНЛАЙН)`, online)
                .replaceAll(`[ОНЛАЙН]`, online) //Replaces "ON" with filtered members that are offline, and a bots
                .replaceAll(`MEM`, members)
                .replaceAll(`(УЧАСТНИКИ)`, members)
                .replaceAll(`[УЧАСТНИКИ]`, members)
                .replaceAll(`ALL`, members) //Replaces 'ALL' with filtered members that are bots
                .replaceAll('BOT', await getBots(guild))
                .replaceAll('VC', await getVoices(guild))
            if(channel.name !== name) channel.setName(name) //If previous channel's name doesn't equal new name - change name
        }catch(err){
            console.error(err) //Throw error if error
        }
    }
};

async function getOnline(guild) {
    let members = await guild.members.fetch()
    return members.filter(mem => ['online', 'idle', 'dnd'].includes(mem.presence?.status) && !mem.user.bot).size
}
async function getMembers(guild) {
    let members = await guild.members.fetch()
    return members.filter(mem => !mem.user.bot).size
}
async function getBots(guild) {
    let members = await guild.members.fetch()
    return members.filter(mem => mem.user.bot).size
}
async function getVoices(guild) {
    let members = await guild.members.fetch()
    return members.filter(mem => mem.voice.channel && !mem.user.bot).size
}