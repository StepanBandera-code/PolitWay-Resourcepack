const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Відображає затримку між хостингом і серверами Discord. Додатково відображає статистику'),
    async execute(interaction) {
        const stats = {
            guilds: interaction.client.guilds.cache.size,
            channels: interaction.client.channels.cache.size,
            users: interaction.client.users.cache.size
        }

        const embed = new EmbedBuilder()
        .addFields(
            { name: 'Затримка між Discord:', value: interaction.client.ws.ping.toString() },
            { name: 'Статистика:', value: `**Сервери:** ${stats.guilds}\n**Канали:** ${stats.channels}\n**Користувачі:** ${stats.users}` }
        )
        .setColor('Yellow')

        await interaction.reply({ embeds: [embed], ephemeral: true })
    }
}