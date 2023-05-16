const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, Embed } = require('discord.js')
const { QuickDB } = require('quick.db')
const quick = new QuickDB()
const moment = require('moment')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('warn')
        .addSubcommand(subcommand => 
            subcommand
            .setName('list')
            .setDescription('Список попереджень конкретного участника')
            .addUserOption(option => option.setName('member').setDescription('Участник').setRequired(true))    
        )
        .addSubcommand(subcommand => 
            subcommand
            .setName('add')
            .setDescription('Відправити попередження участнику')
            .addUserOption(option => option.setName('member').setDescription('Участник').setRequired(true))
            .addStringOption(option => option.setName('reason').setDescription('Причина попередження'))
        )
        .addSubcommand(subcommand => 
            subcommand
            .setName('clear')
            .setDescription('Очистити список попереджень участника')
            .addUserOption(option => option.setName('member').setDescription('Участник').setRequired(true))
            .addStringOption(option => option.setName('reason').setDescription('Коментар до очистки'))
        )
        .setDescription('Попередження участника про порушення')
        .setDefaultMemberPermissions(PermissionFlagsBits.MuteMembers),
    async execute(interaction) {
        let user = interaction.options.getUser('member')
        let reason = interaction.options.getString('reason') || 'Причина не вказана'
        let member = interaction.guild.members.cache.get(user.id)
        if(!member) return await interaction.reply({ content: 'Цього користувача немає на цьому сервері', ephemeral: true })
        if(member.user.bot) return await interaction.reply({ content: 'Цю команду не можна використовувати на ботів', ephemeral: true })

        const db = quick.table('warns')
        let fdb = await db.get(`${interaction.guild.id}.${member.id}`) || []

        const logs = await quick.table('logs').get(`${interaction.guild.id}.channel`)
        let channel = interaction.guild.channels.cache.get(logs)

        if(interaction.options.getSubcommand() === 'list'){
            let list = fdb.map(i => `**${moment(i.time).format('L')} ${moment(i.time).format('LT')}:** ${i.reason || `Причина не вказана`}\n(<@${i.mod}>)`).join(`\n`)

            let embed = new EmbedBuilder()
            .setAuthor({ name: `Список попереджень участника ${member.user.username}`, iconURL: member.user.avatarURL({ dynamic: true }) })
            .setColor('Orange')
            .setFooter({ text: `Загальна кількість: ${fdb.length || '0'}`, iconURL: interaction.guild.iconURL() })
            if(list[0]) embed.setDescription(list.toString().slice(0, 4000))
            return interaction.reply({ embeds: [embed], ephemeral: true })
        }else if(interaction.options.getSubcommand() === 'add'){
            if(member.roles.highest.position > interaction.member.roles.highest.position) return await interaction.reply({ content: 'Цей користувач знаходиться вище за Вас в правах.', ephemeral: true })
    
            await db.push(`${interaction.guild.id}.${member.id}`, { time: Date.now(), mod: interaction.user.id, reason: reason.slice(0, 80) || null })
    
            let sucEmbed = new EmbedBuilder()
            .setAuthor({ name: 'Повідомлення відправлено!', url: require('../functions/memes.js')(1) })
            .setColor('Green')
            .setDescription('**Причина:**\n' + reason)
            .setFooter({ text: `Кількість попереджень: ${fdb.length+1}` })
            await interaction.reply({ embeds: [sucEmbed], ephemeral: true })

            try{
                let dmEmbed = new EmbedBuilder()
                .setAuthor({ name: 'Попередження про порушення' })
                .setColor('Red')
                .setTimestamp()
                .setDescription(`**Вам надійшло попередження, від модератора серверу на якому Ви знаходитесь.**\n**Причина:** ${reason.slice(0, 1000)}`)
                .addFields(
                    { name: 'Що це означає?', value: 'Особисто ми не вживаємо ніяких заходів.\nПри великій кількості попереджень модератори серверу можуть накласти на Вас обмеження на свій розсуд.' },
                    { name: 'Ваша кількість попереджень за весь час', value: `${fdb.length+1}` }
                )
                .setFooter({ text: 'Попередження з серверу ' + interaction.guild.name, iconURL: interaction.guild.iconURL() })
                await member.send({ embeds: [dmEmbed] })
            }catch(err){
                console.error(err)
            }

            if(!channel) return;
            let logEmbed = new EmbedBuilder()
            .setAuthor({ name: `Нове попередження | ${member.nickname || member.user.username}`, iconURL: member.user.avatarURL({ dynamic: true }) })
            .setColor('Orange')
            .setTimestamp()
            .setFooter({ text: `USID: ${member.id}` })
            .addFields(
                { name: 'Участник', value: `${member}`, inline: true },
                { name: 'Модератор', value: `${interaction.user}`, inline: true },
                { name: 'Загальна кількість', value: `${fdb.length+1}`, inline: true },
                { name: 'Причина', value: `${reason.slice(0, 1000) || 'Причина не вказана'}` },
            )
            channel.send({ embeds: [logEmbed] }).catch(err => console.error(err))

        }else{
            await db.delete(`${interaction.guild.id}.${member.id}`)

            let embed = new EmbedBuilder()
            .setAuthor({ name: 'Попередження видалено', url: require('../functions/memes.js')(1), iconURL: member.user.avatarURL({ dynamic: true }) })
            .setColor('Green')
            .setDescription(`${member} - попередження очищені\n**Коментар:** ` + reason || 'Не вказано')
            await interaction.reply({ embeds: [embed], ephemeral: true })

            if(!channel) return;
            let logEmbed = new EmbedBuilder()
            .setAuthor({ name: `Попередження очищені | ${member.nickname || member.user.username}`, iconURL: member.user.avatarURL({ dynamic: true }) })
            .setColor('Green')
            .setTimestamp()
            .setFooter({ text: `USID: ${member.id}` })
            .addFields(
                { name: 'Участник', value: `${member}`, inline: true },
                { name: 'Модератор', value: `${interaction.user}`, inline: true },
                { name: 'Коментар', value: `${reason.slice(0, 1000) || 'Не вказано'}` },
            )
            channel.send({ embeds: [logEmbed] }).catch(err => console.error(err))

        }
    }
}