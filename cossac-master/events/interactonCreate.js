require(`dotenv`).config()
const { 
    EmbedBuilder,
    PermissionsBitField,
    PermissionFlagsBits } = require('discord.js');

const cd = new Set(); //New set for the cooldowns
const cdTime = 5000; //If you want to, you can change the cooldown time (miliseconds)

const { QuickDB } = require('quick.db')
const db = new QuickDB()
 
module.exports = {
    name: 'interactionCreate',
    once: false,
    async execute (interaction) {

        if(interaction.isCommand()){ //If interaction is command
        if (cd.has(interaction.user.id)) { //If Set has user id
            await interaction.reply({ embeds: [{ author: { name: `Охолодись! Команди можна писати лишень раз в ${cdTime / 1000} секунд!` }, color: 0xcc7229 }], ephemeral: true })
            //Reply with cd message
          } else {
            const command = interaction.client.commands.get(interaction.commandName) //Get command name from interaction
            if(!command) return; //if command is not exist return (should add an error message)
            try { //Try to
                await command.execute(interaction); //Execute command

                cd.add(interaction.user.id); //Add an user id to Set
                setTimeout(() => {
                  cd.delete(interaction.user.id);
                }, cdTime); //Make an timeout
            } catch (err) { //If error
                if(err) console.error(err)
            }
        }
        }else if(interaction.isContextMenuCommand()){ //If interaction is context command
            const { commands } = client; //Get commands from client 
            const { commandName } = interaction; //Get command name from interaction
            const contextCommand = commands.get(commandName) //Find comand by command name
            if(!contextCommand) return; //if command is not exist return (should add an error message)

            try{ //Try to
                await contextCommand.execute(interaction) //Execute command
            }catch(err){ //If error
                if(err) console.error(err)
            }
        }else if(interaction.isButton()){ //If interaction is button
            const buttons = await Array.from(interaction.client.buttons.keys()) //Get client.interaction keys
            let button
            for (let i in buttons){ //Loop throught every button
                if(interaction.customId.startsWith(buttons[i])) button = require(`../buttons/${buttons[i]}.js`) //If interaction.customId starts with button's name, define button file
            }
            if(!button) return; //Return an if button file is not exist
            if(button.permission){ //If button file has permissions
                let permissionBit = new PermissionsBitField([button.permission]) //Make a permissions bit
                if(!interaction.member.permissions.has(permissionBit)) return await interaction.reply({ embeds: [{ author: { name: 'Недостатньо прав!' }, color: 0xcc7229 }], ephemeral: true }) //Return if user doesn't have specified permissions
            }
            await button.execute(interaction) //Execute button
        }else if(interaction.isStringSelectMenu()){
            if (interaction.customId === 'roles') {
                let prefix = await db.table('misc').get(`${interaction.guild.id}.prefix`)
                let max = await db.table('misc').get(`${interaction.guild.id}.maximum`)
                if(!prefix){
                    await interaction.message.delete()
                    return interaction.reply({ content: 'На цьому сервері більше не працюють ролі для видачі', ephemeral: true })
                }

                var text = ``

                let list = interaction.message.components[0].components[0].data.options

                if(max && interaction.message.components[0].components[0].data.max_values !== max){
                    await interaction.reply({ content: 'Цей список не відповідає дійсності, ми оновили його.', ephemeral: true })
                    interaction.message.components[0].components[0].data.max_values = max
                    return interaction.message.edit({ components: [interaction.message.components[0]] })
                }

                //if(!interaction.member.manageable) return await interaction.reply({ content: 'В мене недостатньо прав щоб редагувати Ваші ролі', ephemeral: true })
                //So I thought that 'manageable' means that it shows whenever bot can edit user's roles. (?)
                //I'll remove it and see how it'll perform

                if(!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageRoles)) return await interaction.reply({ content: 'Я не маю відповідних прав на виконання цієї дії', ephemeral: true })

                for(let i in list){
                    let role = interaction.guild.roles.cache.get(list[i].value)
                    if(!role || !role.name.startsWith(prefix)) return await interaction.reply({ content: 'Помилка. Спробуйте вивести список щераз', ephemeral: true })
                    if(interaction.values.includes(list[i].value)){
                        //Add role
                        if(!interaction.member.roles.cache.has(role.id)){
                            if(!role.editable){
                                text += `Не вдалось додати: ${role}\n`
                                continue;
                            }
                            interaction.member.roles.add((list[i].value))
                            text += `Добавлено: ${role}\n`
                        }
                    }else{
                        //Remove role
                        if(interaction.member.roles.cache.has(role.id)){
                            if(!role.editable){
                                text += `Не вдалось видалити: ${role}\n`
                                continue;
                            }
                            interaction.member.roles.remove((list[i].value))
                            text += `Вилучено: ${role}\n`
                        }
                    }
                }

                const embed = new EmbedBuilder()
                .setAuthor({ name: 'Ваші ролі оновлено!' })
                .setColor('Random')
                if(text.length >= 1) embed.setDescription(text)
                await interaction.reply({ embeds: [embed], ephemeral: true })
            }
        }
    }
}