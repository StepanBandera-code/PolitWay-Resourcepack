const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const { QuickDB } = require('quick.db')
const db = new QuickDB().table('lobbies')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('private')
        .setDescription('Створення та управління Вашим особистим голосовим каналом')
        .addSubcommandGroup(group => 
            group
            .setName(`manage`)
            .setDescription(`Керування особистим голосовим каналом.`)
            .addSubcommand(subcommand => 
                subcommand
                .setName(`limit`)
                .setDescription(`Встановити ліміт на кількість приєднаних до Вашого каналу (Корисно якщо канал публічний).`)    
                .addIntegerOption(option => option.setName(`limit`).setDescription(`Число від 2 до 99`).setRequired(true))
            )
            .addSubcommand(subcommand => 
                subcommand
                .setName(`public`)
                .setDescription(`Відкрити доступ до цього каналу усім участникам серверу`)  
                .addBooleanOption(option => option.setName('bool').setDescription('True - відкритий / False - закритий').setRequired(true))
            )
            .addSubcommand(subcommand => 
                subcommand
                .setName(`delete`)
                .setDescription(`Видалити Ваш особистий канал.`)    
            )
        )
        .addSubcommand(subcommand => 
            subcommand
            .setName(`invite`)
            .setDescription(`Надати право участнику цього серверу заходити та розмовляти у Вашому каналі.`)    
            .addUserOption(option => option.setName(`member`).setDescription(`Участник цього серверу`).setRequired(true))
        )
        .addSubcommand(subcommand => 
            subcommand
            .setName(`kick`)
            .setDescription(`Відключити та заборонити запрошеному участнику приєднуватись до Вашого каналу.`)    
            .addUserOption(option => option.setName(`member`).setDescription(`Участник цього серверу`).setRequired(true))
        )
        .addSubcommand(subcommand => 
            subcommand
            .setName(`create`)
            .setDescription(`Створити/Перестворити Ваш особистий канал.`)
        ),
    async execute(interaction) {
        let channels = interaction.client.privates //Gets the client.privates from client itself 

        if(interaction.options.getSubcommand() === `create`){ //Subcommand 'create'
            if(!await db.get(interaction.guild.id) || !interaction.guild.channels.cache.get(await db.get(interaction.guild.id))){ //Looking for lobby channel in database
                await db.delete(interaction.guild.id) //Delete lobby channel from db if it's set but isn't on a server
                let embed = new EmbedBuilder()
                .setAuthor({ name: `Відсутній канал лоббі!` })
                .setColor('Orange')
                .setDescription('На цьому сервері відсутній канал лоббі.\nЗверніться до адміністратора.')
                .setFooter({ text: `Встановити: /prefs vclobby [lobby]` })
                return await interaction.reply({ embeds: [embed], ephemeral: true }) //Creates an embed then sends it
            }

            let channel = interaction.guild.channels.cache.get(channels[`${interaction.guild.id}_${interaction.member.id}`]) //Gets a private channel
            if(channels[`${interaction.guild.id}_${interaction.member.id}`] && channel){ //If private was found (Recreate the channel)
                await require(`../functions/vc_create.js`)(interaction.member, interaction.guild, interaction.client).then(async cha => { //Requries a function, that creates a new channel
                    let embed = new EmbedBuilder()
                    .setAuthor({ name: `Канал пере-створений` }) //Embed says 'Channel was re-created'
                    .setDescription(`Ваш новий канал: **${cha}**`) //Embed's description has new channel name
                    .setColor(`#2CF5AA`)
                    return await interaction.reply({ embeds: [embed], ephemeral: true }) //Creates an embed then sends it
                })
                await channel.delete()
            }else{ //Private doesn't exist / Wasn't found
                require(`../functions/vc_create.js`)(interaction.member, interaction.guild, interaction.client).then(async cha => { //Requries a function, that creates a new channel
                    let embed = new EmbedBuilder()
                    .setAuthor({ name: `Канал створений` }) //Embed says 'Channel was created'
                    .setDescription(`Ваш новий канал: **${cha}**`) //Embed's description has new channel name
                    .setColor(`#2CF5AA`)
                    return await interaction.reply({ embeds: [embed], ephemeral: true }) //Creates an embed then sends it
                })
            }

        }

        let channel = interaction.guild.channels.cache.get(channels[`${interaction.guild.id}_${interaction.member.id}`])
        if(!channels[`${interaction.guild.id}_${interaction.member.id}`] 
        || !channel) return await interaction.reply({ embeds: [{ author: { name: `У вас немає створеного каналу!` }, color: 0xcc7229 }], ephemeral: true })
        //If user's private does not exist - return

        if(interaction.options.getSubcommand() === `invite`){ //'invite' subcommand
            let member = interaction.options.getMember('member') //Gets a member from interaction
            channel.permissionOverwrites.edit(member.id, { ViewChannel: true }) //Overwrite the permission, allow specified member to view channel
            await interaction.reply({ embeds: [{ author: { name: `${member.user.username} був добавлений до Вашого каналу!` }, color: 0x2CF5AA }], ephemeral: true }) //Send a success message
        }
        if(interaction.options.getSubcommand() === `kick`){ //'kick' subcommand
            let member = interaction.options.getMember('member') //Gets a member from interaction
            channel.permissionOverwrites.edit(member.id, { ViewChannel: false }) //Overwrite the permission, deny specified member to view channel
            if(member.voice.channel && member.voice.channel.id === channel.id) member.voice.disconnect() //If member is in voice chat, and chat's id = private id - kick member from vc
            await interaction.reply({ embeds: [{ author: { name: `${member.user.username} був виключений з Вашого каналу!` }, color: 0x2CF5AA }], ephemeral: true }) //Send a success message
        }
        if(interaction.options.getSubcommandGroup() === 'manage'){ //'manage' subcommand group
            if(interaction.options.getSubcommand() === `public`){ //'public' subcommand
                let bool = interaction.options.getBoolean('bool') //Gets a boolean from interaction
                if(bool){ //If boolean is true
                    channel.permissionOverwrites.edit(interaction.guild.id, { ViewChannel: true }); //Allow all the members to view user's private channel
                    return await interaction.reply({ embeds: [{ author: { name: `Ваш канал тепер доступний усім!` }, color: 0x2CF5AA }], ephemeral: true }); //Send a success message
                }else{ //If boolean is false
                    channel.permissionOverwrites.edit(interaction.guild.id, { ViewChannel: false }); //Deny all the member to view user's private channel
                    return await interaction.reply({ embeds: [{ author: { name: `Ваш канал тепер доступний тільки Вам, та усім кого Ви запросили.` }, color: 0x2CF5AA }], ephemeral: true }); //Send a success message
                }
            }else if(interaction.options.getSubcommand() === `limit`){ //'limit' subcommand
                let num = await interaction.options.getInteger('limit') //Gets an integer from interaction
                var limi
                if(num > 99) limi = 99 //If integer is more than 99 = limit-99
                else if(num < 2) limi = 2 //If integer is less than 2 = limit-2
                else limi = num //Integer is limit
                channel.setUserLimit(limi) //Set channel userlimit to limit
                return await interaction.reply({ embeds: [{ author: { name: `Ліміт участників - ${limi}` }, color: 0x2CF5AA }], ephemeral: true }); //Send a sucess message
            }else if(interaction.options.getSubcommand() === `delete`){ //'delete' subcommand
                require('../functions/vc_delete.js')(interaction.member, channel, interaction.client) //Require a function that will delete channel
                return await interaction.reply({ embeds: [{ author: { name: `Канал видалений.` }, color: 0x2CF5AA }], ephemeral: true }); //Send a sucess message 
            }
        }
    }
}