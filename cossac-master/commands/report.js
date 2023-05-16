const { 
    ContextMenuCommandBuilder, 
    ApplicationCommandType, 
    EmbedBuilder, 
    ActionRowBuilder,
    ButtonBuilder
    } = require('discord.js')
const { QuickDB } = require(`quick.db`)
const db = new QuickDB().table(`logs`)

const count = {} //Reported array
const repstomute = 5

module.exports = {
    data: new ContextMenuCommandBuilder()
        .setName('Поскаржитись') //Context command name
        .setType(ApplicationCommandType.Message), //Context command type
    async execute(interaction) {
        let message = await interaction.channel.messages.fetch(interaction.targetId) //Fetches a target message
        if(message.author.bot) return await interaction.reply({ embeds: [{ author: { name: 'Не можна скаржитись на ботів!' }, color: 0xcc2929 }], ephemeral: true }) //Can't report bot
        if(message.author.id === interaction.user.id) return await interaction.reply({ embeds: [{ author: { name: 'Не можна скаржитись на себе!' }, color: 0xcc2929 }], ephemeral: true }) //User can't report itself

        if(!count[message.author.id]){ //If user was not reported last minute
            count[message.author.id] = { //Add an author to an array
                members: [interaction.user.id] //Push interaction.user's id to an array
            }
            setTimeout(() => { delete count[message.author.id] }, 60000) //create timeout
        }else{
            if(count[message.author.id].members.includes(interaction.user.id)) return await interaction.reply({ embeds: [{ author: { name: 'Ви вже поскаржились на цього участника!' }, color: 0xcc2929 }], ephemeral: true }) //Return if user allready reported this author
            count[message.author.id].members.push(interaction.user.id) //Push interaction.user's id to an array

            let dbc = await db.get(`${interaction.guild.id}.channel`) //Get log channel id from db
            let log = await interaction.guild.channels.cache.get(dbc) //Find log channel at guild
            if(log){ //If log channel exist
                const row = new ActionRowBuilder() //Make an action row with 3 buttons (ban, kick, mute)
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`mute_${message.author.id}`)
                        .setLabel('Заблокувати чат (5 хв)')
                        .setStyle(`Danger`),
                )
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`kick_${message.author.id}`)
                        .setLabel('Вигнати')
                        .setStyle(`Danger`),
                )
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`ban_${message.author.id}`)
                        .setLabel('Заблокувати (Очистити повідомлення)')
                        .setStyle(`Danger`),
                );
                let embed = new EmbedBuilder() //Make the new embed
                .setAuthor({ name: `Нова скарга! (${count[message.author.id].members.length}/${repstomute})` }) //Add an author to an embed
                .addFields({ name: `Участник`, value: `${message.author}` }) //Add a field with the author's name
    
                if((count[message.author.id].members.length / repstomute * 100) === 100){ //if user has been reported enought times
                    embed //Add color, desc, footer to the embed
                    .setColor(`Red`)
                    .setDescription("Контекст повідомлення\n```" + message.content + "```")
                    .setFooter({ text: `Ми видалили повідомлення та заблокували чат на 60 секунд` })
                    message.delete()
                    message.member.timeout(60 * 1000, `Велика кількість скарг на хвилину (${count[message.author.id].members.length})`) //Mute author
                    message.member.send({
                        "author": {
                            "name": "Чат заблоковано!"
                        },
                        "description": "Ми тимчасово заблокували тобі можливість писати та розмовляти в чаті через велику кількість скарг. ",
                        "footer": {
                            "text": "Блокування завершиться через 60 секунд"
                        },
                        "color": 15879747
                    })
                    .catch(O_o=>{}) //Try to send a message to the author
    
                    log.send({ embeds: [embed], components: [row] }) //Send embed to the log channel
                }else if((count[message.author.id].members.length / repstomute * 100) > 50){ //if user has been reported half of the times
                    embed
                    .setTitle(`ПЕРЕЙТИ ДО ПОВІДОМЛЕННЯ`)
                    .setURL(message.url)
                    .setColor(`Orange`)
                    .setDescription("Контекст повідомлення\n```" + message.content + "```")
                    .setFooter({ text: 'Ми не вжили ніяких заходів, поки-що..' })
    
                    log.send({ embeds: [embed], components: [row] }) //Send embed to the log channel
                }else{ //if user has been reported less than half of the times
                    embed
                    .setTitle(`ПЕРЕЙТИ ДО ПОВІДОМЛЕННЯ`)
                    .setURL(message.url)
                    .setColor(`Aqua`)
                    .setDescription("Контекст повідомлення\n```" + message.content + "```")
                    .setFooter({ text: 'Ми не вжили ніяких заходів, поки-що..' })
    
                    log.send({ embeds: [embed], components: [row] }) //Send embed to the log channel
                }
            }
            }



        await interaction.reply({ embeds: [{ author: { name: 'Скарга успішно відправлена!' }, color: 0x33a64e }], ephemeral: true })
    }
}