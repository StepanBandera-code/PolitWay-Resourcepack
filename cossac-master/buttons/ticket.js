const { PermissionsBitField, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')

const cd = new Set()

module.exports = { //BUTTON'S INFORMATION
    id: "ticket",
    async execute(interaction){
        if(cd.has(interaction.user.id)) return await interaction.reply({ content: 'Тікети можна створювати раз в 10 хвилин', ephemeral: true })

        let chName = interaction.guild.channels.cache.filter(channel => channel.name.startsWith('ticket_') || channel.name.startsWith('archi_')).size || 0

        if(!interaction.message.embeds[0].data.footer){
            await interaction.message.delete()
            return interaction.reply({ content: 'Це стара версія тікетів. Створіть це повідомлення знову командою /ticket', ephemeral: true })
        }
        const ids = interaction.message.embeds[0].data.footer.text.split('/');
        for (i in ids) {
          if (ids[i] === '0') {
            ids[i] = undefined;
          }
        }

        try{
            let channel = await interaction.guild.channels.create({ //Creates a new channel
                name: `ticket_${chName+1}`,
                parent: ids[0] || undefined,
                position: 0,
                permissionOverwrites: [
                    {
                        id: interaction.guild.id,
                        deny: [PermissionsBitField.Flags.ViewChannel], //Deny all the members
                    },
                    {
                        id: interaction.member.id,
                        allow: [PermissionsBitField.Flags.ViewChannel], //Allow ticket creator
                    },
                    {
                        id: ids[1] || interaction.member.id,
                        allow: [PermissionsBitField.Flags.ViewChannel], //Allow mod role
                    },
                ],
            })

            const embed = new EmbedBuilder()
            .setAuthor({ name: 'Тікет створено!' })
            .setDescription('**Незабаром уповноважені люди зможуть відповісти на ваше запитання.**\nВи можете почати описувати свою проблему поки очікуєте.')
            .setColor('Green')

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                    .setCustomId(`tick_0`)
                    .setLabel('Закрити обговорення')
                    .setStyle(ButtonStyle.Danger)
            )

            channel.send({ content: '@here', embeds: [embed], components: [row] }).then(msg => msg.pin())

            await interaction.reply({ content: `Тікет створено! Продовжуйте в ${channel}`, ephemeral: true })

            cd.add(interaction.user.id)
            setTimeout(() => {
                cd.delete(interaction.user.id)
            }, 10 * 60000)
        }catch(err){
            console.error(err)
            await interaction.reply({ content: 'Щось пішло не так!', ephemeral: true })
        }
}}