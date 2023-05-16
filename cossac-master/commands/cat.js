const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

module.exports = {
    data: new SlashCommandBuilder()
        .setName('cat')
        .setDescription('Випадкові фотографії котів!'),
    async execute(interaction) {
        await interaction.deferReply()

        const responce = await fetch('https://api.thecatapi.com/v1/images/search')
        if(!responce.ok){
            console.error(`Cound't fetch image`)
            console.error(responce)
            return await interaction.editReply('Не вдалося отримати зображення від API')
        }
        let json = await responce.json()
        let embed = new EmbedBuilder()
        .setAuthor({ name: 'Випадкова киця!' })
        .setColor('Orange')
        .setImage(json[0].url)
        .setFooter({ text: 'Зображення взято з сайту "thecatapi.com". Ми не відповідаємо за зміст.' })
        await interaction.editReply({ embeds: [embed] })
    }
}