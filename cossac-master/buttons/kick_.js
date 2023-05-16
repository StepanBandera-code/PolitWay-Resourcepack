const { PermissionsBitField } = require('discord.js');

module.exports = { //BUTTON'S INFORMATION
    id: "kick_",
    permission: [PermissionsBitField.Flags.KickMembers], //EXPORTS A PERMISSION THAT WILL BE CHECKED WHEN BUTTON IS CLICKED
    async execute(interaction){
        const member = await interaction.guild.members.cache.get(interaction.customId.slice(5)) //Removes first 5 characters from interaction.cutomId to get member's id
        if(member){
            try{ //Trying to kick a member
                member.kick(`${interaction.user.tag}: Вигнати участника з серверу`)
                await interaction.reply({ embeds: [{ author: { name: 'Участник був успішно вигнаний' }, color: 0x33a64e }], ephemeral: true })
            }catch(err){ //Returns an error if error 0_0
                console.error(err)
                await interaction.reply({ content: `Щось пішло не так. Спробуйте ще-раз піздніше або зверніться до адміністратора.`, ephemeral: true })
            }   
        }else{ //If coudn't find a member - delete buttons and send a message
            await interaction.update({embeds: interaction.message.embeds, components: []})
            await interaction.followUp({ embeds: [{ author: { name: 'Цей участник більше не знаходиться на сервері.' }, color: 0xcc7229 }], ephemeral: true })
        }
    }
}