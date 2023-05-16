const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const random = require('../functions/memes.js');
const wait = require('node:timers/promises').setTimeout;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('8ball')
        .setDescription('Задайте запитання і ми начаклуємо відповідь')
        .addStringOption(option => option.setName('question').setDescription('Питання шару').setRequired(true)),
    async execute(interaction) {
        await interaction.deferReply()

        await wait(4000)

        let embed = new EmbedBuilder()
        .setAuthor({ name: 'Магічний шар каже..', iconURL: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/8-Ball_Pool.svg/1024px-8-Ball_Pool.svg.png' })
        .setDescription(`**Запитання:** "${interaction.options.getString('question')}"\n\n` + random(2))
        .setColor('DarkButNotBlack')
        .setFooter({ text: 'Вживання магії шкодить Вашому здоров\'ю' })

        await interaction.editReply({ embeds: [embed] })
    }
}