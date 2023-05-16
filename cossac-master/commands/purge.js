const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('purge')
        .setDescription('Очищення декілька повідомлень за секунду')
        .addIntegerOption(option => 
            option
            .setMinValue(0)
            .setMaxValue(100)
            .setName('amount')
            .setRequired(true)
            .setDescription('Максимальна кількість повідомлень'))
        .addUserOption(option => option.setName('user').setDescription('Користувач, повідомлення якого потрібно очистити'))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
    async execute(interaction) {
        const amount = interaction.options.getInteger('amount')
        const user = interaction.options.getUser('user')
        
        var messages = await interaction.channel.messages.fetch({ limit: amount })
        if(user) messages = messages.filter(m => m.author.id === user.id)

        const agedMessages = messages.filter(m => m.createdTimestamp < Date.now() - 1000 * 60 * 60 * 24 * 14);
        
        await interaction.channel.bulkDelete(messages, true).then(async msgs => {
            const embed = new EmbedBuilder()
                .setColor('Green')
                .setTitle('Успішно очищено')
                .setDescription(`Очищено: ${msgs.size}\nОчікує очищення: ${agedMessages.size}`)
            await interaction.reply({ embeds: [embed], ephemeral: true })

            let n = 1;
            agedMessages.forEach(async msg => {
                setTimeout(async () => {
                    await msg.delete()
                    n++
                }, n * 1000)
            })

        })
        


//END
}}