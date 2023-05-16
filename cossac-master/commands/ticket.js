const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket')
        .setDescription('Майстер встановлення системи запитань')
        .addChannelOption(option => 
            option.setName('category')
            .setDescription('Категорія, в якій будуть створюватись канали для запитів.')
            .addChannelTypes(ChannelType.GuildCategory)
        )
        .addRoleOption(option => option.setName('role').setDescription('Роль, власники якої зможуть бачити сворені канали'))
        .addStringOption(option => option.setName('text').setDescription('Користувацький опис для повідомлення'))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async execute(interaction) {

        const embed = new EmbedBuilder()
        .setAuthor({ name: 'Створення тікетів!' })
        .setColor('Green')
        .setDescription(interaction.options.getString('text') || 'Натисніть на кнопку внизу щоб створити тікет')
        .setFooter({ text: `${interaction.options.getChannel('category')?.id || "0"}/${interaction.options.getRole('role')?.id || "0"}` })

        const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
            .setCustomId(`ticket`)
            .setEmoji('🛎️')
            .setLabel('Створити новий')
            .setStyle(ButtonStyle.Primary)
        )

        await interaction.channel.send({ embeds: [embed], components: [row] })

        await interaction.reply({ content: 'Повідомленя створено!', ephemeral: true })
    }
}