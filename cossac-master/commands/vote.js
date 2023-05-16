const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')
const { QuickDB } = require('quick.db')
const db = new QuickDB().table('votes')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('vote')
        .setDescription('Створити голосування напряму в чаті')
        .addStringOption(option => option.setName('label').setDescription('Назва голосування').setRequired(true))
        .addStringOption(option => option.setName('option1').setDescription('Варіант 1').setRequired(true))
        .addStringOption(option => option.setName('option2').setDescription('Варіант 2').setRequired(true))
        .addStringOption(option => option.setName('option3').setDescription('Додатковий варіант'))
        .addStringOption(option => option.setName('option4').setDescription('Додатковий варіант'))
        .addStringOption(option => option.setName('option5').setDescription('Додатковий варіант')),
    async execute(interaction) {
        let id = Date.now()

        await db.set(id.toString(), {
            author: interaction.user.id,
            options: []
        })

        var options = []
        for (let i = 0; i <= 5; i++) {
            let option = interaction.options.getString(`option${i}`)
            if(option){
                options.push(option.slice(0, 800))

                await db.push(`${id}.options`, { name: option, value: [] })
            }
         }

        const mainRow = new ActionRowBuilder()
        let list = []
        for (i = 0; i < options.length; i++) {
            list.push(`**${i + 1}.** ${options[i]} (0%)`)

            mainRow.addComponents(
                new ButtonBuilder()
                .setLabel(`${i + 1}`)
                .setCustomId(`vote_${i + 1}`)
                .setStyle(ButtonStyle.Primary)
            )
        }

        const secRow = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
            .setLabel(`Закрити голосування`)
            .setCustomId(`cvote`)
            .setStyle(ButtonStyle.Danger)
        )

        const embed = new EmbedBuilder()
        .setAuthor({ name: `${interaction.options.getString('label').slice(0, 256)}` })
        .setDescription(`${list.join('\n')}`)
        .setFooter({ text: `${id}` })
        .setColor('Random')
        await interaction.reply({ embeds: [embed], components: [mainRow, secRow] })
    }
}