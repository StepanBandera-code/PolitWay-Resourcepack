const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, Embed } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dice')
        .setDescription('Створити стіл для гральних кубиків'),
    async execute(interaction) {
        let embed = new EmbedBuilder()
        .setAuthor({ name: 'Стіл для гральних кубиків!' })
        .setFooter({ text: 'Натисніть на кнопку щоб кинути кубик' })
        .setColor('White')

        let random = Math.floor(Math.random()*10000000);
        let row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
            .setCustomId(random.toString())
            .setLabel("Кинути кубики")
            .setStyle(ButtonStyle.Primary)
            .setEmoji('🎲')
        )

        let int = await interaction.reply({ embeds: [embed], components: [row] })

        var members = {}
        var description = ''
        const filter = i => i.customId === random.toString()
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 30000 });

        collector.on('collect', m => {     
            if(!members[m.user.id]){
                let dice1 = Math.floor(Math.random() * (8 - 1 + 1) + 1)
                let dice2 = Math.floor(Math.random() * (8 - 1 + 1) + 1)   
                members[m.user.id] = dice1+dice2

                description = description+`**${m.member.nickname || m.user.username}:** ${dice1}:${dice2}\n`
                m.message.embeds[0].data.description = description
    
                m.update({ embeds: [m.message.embeds[0]] })
            }else{
                m.reply({ content: "Ви вже кинули.", ephemeral: true })
            } 
        });
        
        collector.on('end', async collected => {
            if(Object.keys(members).length === 0){
                let newEmbed = new EmbedBuilder()
                .setAuthor({ name: 'Стіл для гральних кубиків!' })
                .setFooter({ text: 'Ніхто не кинув кубик' })
                .setColor('Red')
                return await interaction.editReply({ embeds: [newEmbed], components: [] })
            }

            var greatest = { id: null, num: 0 }
            for (let i in members){
                if(members[i] > greatest.num) greatest = { id: i, num: members[i] }
            }
            
            let newEmbed = collected.first().message.embeds[0]
            newEmbed.data.description = `**Переможець ${interaction.guild.members.cache.get(greatest.id).user.username} з результатом ${greatest.num}**\n\n` + newEmbed.data.description
            newEmbed.data.footer = null
            newEmbed.data.color = 0x32a852
            interaction.editReply({ embeds: [newEmbed], components: [] })
        });  
    }
}