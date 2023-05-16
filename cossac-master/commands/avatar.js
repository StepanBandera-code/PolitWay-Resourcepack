const { ContextMenuCommandBuilder, ApplicationCommandType, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new ContextMenuCommandBuilder()
        .setName('Отримати аватар участника') //Context command name
        .setType(ApplicationCommandType.User), //Context command type
    async execute(interaction) {
        try{ //Trying to create an embed with user's avatar
            let target = await interaction.targetUser
            const embed = new EmbedBuilder()
            .setAuthor({ name: `Аватар ${target.username}`, url: require(`../functions/memes.js`)(1) })
            .setImage(target.displayAvatarURL({ dynamic: true, size: 2048 }))
            .setColor('Green')
            await interaction.reply({ embeds: [embed], ephemeral: true })
        }catch(err){ //Returns an error message if error (Probably target user has no avatar)
            console.error(err)
            await interaction.reply({ embeds: [{ author: { name: 'Отакої! Виникла помилка, скоріше за все в участника не встановлений аватар' }, color: 0xcc2929 }], ephemeral: true })
        }
    }
}