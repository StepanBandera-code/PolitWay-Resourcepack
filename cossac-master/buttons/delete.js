const { PermissionsBitField } = require('discord.js');

module.exports = { //BUTTON'S INFORMATION
    id: "delete",
    permission: [PermissionsBitField.Flags.ManageChannels], //EXPORTS A PERMISSION THAT WILL BE CHECKED WHEN BUTTON IS CLICKED
    async execute(interaction){
        interaction.channel.delete()
    }
}