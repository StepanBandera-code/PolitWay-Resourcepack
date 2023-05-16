const { PermissionsBitField, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { QuickDB } = require('quick.db');
const db = new QuickDB().table('logs')
const exist = require('../functions/multValue.js')

module.exports = {
    id: "sw_",
    permission: [PermissionsBitField.Flags.ManageRoles],
    async execute(interaction){
        const types = require('../switches_types.json') //Require types

        if(interaction.component.data.style === 3){
            //Turn off the switch
            await db.pull(`${interaction.guild.id}.types`, types[interaction.customId]) //Delete one or several types from database
            interaction.component.data.style = 4 //Change button style to DANGER
        }else{
            //Turn on the switch
            const array = await db.get(`${interaction.guild.id}.types`) || []
            if(!exist(array, types[interaction.customId])){
                types[interaction.customId].forEach(type => {
                    array.push(type)
                });
                await db.set(`${interaction.guild.id}.types`, array)
            }
            //If database has none of specified types - add a types to database
            interaction.component.data.style = 3 //Change button style to SUCCESS
        }

        let row = new ActionRowBuilder() //Creates the new act.row
        for (let i in interaction.message.components[0].components){ //Loops throught every button at interaction.message
                row.addComponents(interaction.message.components[0].components[i]) //Adds a button to new action row
        }
        await interaction.update({components: [row]}); //Updates a message
    }
}