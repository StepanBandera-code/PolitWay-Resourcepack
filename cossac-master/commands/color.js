const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder } = require('discord.js')
const { QuickDB } = require('quick.db')
const db = new QuickDB().table('misc')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('color')
        .setDescription('Виводить список ролей для видачі'),
    async execute(interaction) {
        let prefix = await db.get(`${interaction.guild.id}.prefix`)
        if(!prefix) return interaction.reply({ content: 'На цьому сервері вимкнені ролі для видачі', ephemeral: true })

        let max = await db.get(`${interaction.guild.id}.maximum`)

        let role = await interaction.guild.roles.fetch()
        var roles = []
        role.forEach(r => {
            if(r.name.startsWith(prefix)) roles.push({ label: `${r.name.slice(prefix.length)}`, value: `${r.id}` })
        })

        if(!roles[0]) return await interaction.reply({ content: `На сервері відсутні ролі, назва яких починається з \`${prefix}\``, ephemeral: true })

        let list = new StringSelectMenuBuilder()
        .setCustomId('roles')
        .setPlaceholder('Виберіть роль')
        .setMinValues(0)
        .addOptions(roles)
        if(max && max < roles.length) list.setMaxValues(max)
        
        const row = new ActionRowBuilder().addComponents(list);

        const embed = new EmbedBuilder()
        .setAuthor({ name: 'Список ролей!' })
        .setColor('Gold')
        .setDescription('Виберіть одну або декілька ролей щоб додати їх собі\nЗніміть виділення щоб вилучити')

        await interaction.reply({ embeds: [embed], components: [row] })
    }
}