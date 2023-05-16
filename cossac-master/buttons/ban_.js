const { PermissionsBitField } = require('discord.js');

module.exports = { //BUTTON'S INFORMATION
    id: "ban_",
    permission: [PermissionsBitField.Flags.BanMembers], //EXPORTS A PERMISSION THAT WILL BE CHECKED WHEN BUTTON IS CLICKED
    async execute(interaction){
        const member = await interaction.guild.members.cache.get(interaction.customId.slice(4)) //Removes first 4 characters from interaction.cutomId to get member's id
        if(member){
            try{ //Trying to ban a member
                member.ban({ deleteMessageSeconds: 60 * 60, reason: `${interaction.user.tag}: Заблокувати участника та очитити повідомлення за 1 год.` })
                await interaction.reply({ embeds: [{ author: { name: 'Участник був успішно заблокований а повідомлення за останню годину - видалені' }, color: 0x33a64e }], ephemeral: true })
            }catch(err){ //If error returns error message
                console.error(err)
                await interaction.reply({ content: `Щось пішло не так. Спробуйте ще-раз піздніше або зверніться до адміністратора.`, ephemeral: true })
            }   
        }else{ //If coudn't find member - remove buttons and send a messsage
            await interaction.update({embeds: interaction.message.embeds, components: []})
            await interaction.followUp({ embeds: [{ author: { name: 'Цей участник більше не знаходиться на сервері.' }, color: 0xcc7229 }], ephemeral: true })
        }
    }
}