const { QuickDB } = require('quick.db')
const db = new QuickDB().table('votes')

module.exports = {
    id: "cvote",
    async execute(interaction){
        let embed = interaction.message.embeds[0].data
        let vote = await db.get(embed.footer.text)

        if(!vote){
            interaction.message.delete()
            return await interaction.reply({ content: 'Це голосування більше не їснує.', ephemeral: true })
        }
        if(vote.author !== interaction.user.id) return await interaction.reply({ content: 'Голосування можуть закривати лишень його творці.', ephemeral: true })

        await db.delete(embed.footer.text)

        embed.color = 15548997
        embed.footer.text = 'Результати'

        interaction.message.edit({ embeds: interaction.message.embeds, components: [] })
        await interaction.reply({ content: 'Голосування успішно закрито!', ephemeral: true })
    }
}