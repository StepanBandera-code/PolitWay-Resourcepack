const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

module.exports = {
    data: new SlashCommandBuilder()
        .setName('dog')
        .setDescription('Випадкові фотографії собак!'),
    async execute(interaction) {
        await interaction.deferReply()

        const responce = await fetch('https://dog.ceo/api/breeds/image/random')
        if(!responce.ok){
            console.error(`Cound't fetch image`)
            console.error(responce)
            return await interaction.editReply('Не вдалося отримати зображення від API')
        }
        let json = await responce.json()
        let embed = new EmbedBuilder()
        .setAuthor({ name: 'Випадкова собачка!' })
        .setColor('Grey')
        .setImage(json.message)
        .setFooter({ text: 'Зображення взято з сайту "dog.ceo". Ми не відповідаємо за зміст.' })
        await interaction.editReply({ embeds: [embed] })
    }
}