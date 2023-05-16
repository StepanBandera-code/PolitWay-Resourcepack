const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder, ChannelType, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')

module.exports = {
    data: new SlashCommandBuilder()
        .setName('echo')
        .setDescription('Констуктор повідомлень.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addStringOption(option => option.setName('text').setDescription('Текст повідомлення'))
        .addStringOption(option =>
            option.setName('author')
                .setDescription('Вибрати автора повідомлення')
                .addChoices(
                    { name: 'Бот', value: 'bot' },
                    { name: 'Сервер (Webhook)', value: 'server' },
                ))
        .addChannelOption(option => option.setName('channel').setDescription('Канал відправки').addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement))
        .addAttachmentOption(option => option.setName('attachment').setDescription('Файл повідомлення'))
        .addStringOption(option => option.setName('embed_author').setDescription('Заголовок ембеду')) //Embeds
        .addAttachmentOption(option => option.setName('embed_authoricon').setDescription('Картинка біля заголовку'))
        .addStringOption(option => option.setName('embed_desc').setDescription('Опис ембеду'))
        .addStringOption(option => 
            option.setName('embed_color')
            .setDescription('Колір ембеду')
            .addChoices(
                { name: 'Червоний', value: 'Red' },
                { name: 'Синій', value: 'Blue' },
                { name: 'Зелений', value: 'Green' },
                { name: 'Жовтий', value: "Yellow" },
                { name: 'Фіолетовий', value: "Purple" },
                { name: 'Білий', value: 'White' },
                { name: 'Золотий', value: 'Gold' },
            )
        )
        .addStringOption(option => option.setName('embed_footer').setDescription('Нижня секція ембеду'))
        .addAttachmentOption(option => option.setName('embed_footericon').setDescription('Картинка нижньої секції'))
        .addAttachmentOption(option => option.setName('embed_image').setDescription('Зображення ембеду'))
        .addAttachmentOption(option => option.setName('embed_thumbnail').setDescription('Маленьке зображення ембеду'))
        ,
    async execute(interaction) {

        let options = interaction.options

        //If user haven't selected any options, return error
        if(options._hoistedOptions.length === 0) return await interaction.reply({ content: 'Вам необхідно вказати одну з опцій!', ephemeral: true })

        //Object for message
        var message = {}

        //If user selected channel option, use it, otherwise use the channel where the command was executed
        let channel
        if(options.getChannel('channel')) channel = options.getChannel('channel')
        else channel = interaction.channel

        //Send pending message
        await interaction.reply({ embeds: [{ description: '**Формуємо предперегляд.. Це може зайняти трохи часу** \n\nЦікавий факт, на випадок якщо це триває достатньо довго:\n' + require('../functions/memes.js')(3) }], ephemeral: true })

        //Get all the options from the command
        let attachment = options.getAttachment('attachment')
        let embedAuthor = options.getString('embed_author')
        let embedAuthorIcon = options.getAttachment('embed_authoricon')
        let embedDesc = options.getString('embed_desc')
        let embedColor = options.getString('embed_color')
        let embedFooter = options.getString('embed_footer')
        let embedFooterIcon = options.getAttachment('embed_footericon')
        let embedImage = options.getAttachment('embed_image')
        let embedThumbnail = options.getAttachment('embed_thumbnail')
        let text = options.getString('text')
    
        if(text) message.content = text.replaceAll(`!n`, `\n`) //Replace every '!n' with '\n' (Break lines)
    
        if(attachment && attachment.contentType.startsWith('image')) message.files = [attachment.url] //If image has been specified, attach it as the MESSAGE ATTACHMENT
        
        let embed = new EmbedBuilder() //Create an embed

        //Embed author
        if(embedAuthor && embedAuthor.length > 256) return interaction.editReply({ embeds: [{ author: { name: 'Макимальна кількість символів embed.author = 256' }, color: 0xeb4c34 }], ephemeral: true, components: []}) //Return error if specified embed author is too long
        if(embedAuthor && embedAuthorIcon && embedAuthorIcon.contentType.startsWith('image')){ //Check if author is specified. If author icon also was specified, and it's an image, put it as author icon
            embed.setAuthor({ name: embedAuthor, iconURL: embedAuthorIcon.url })
        }else{ //If image is not corrent, just set an author
            if(embedAuthor) embed.setAuthor({ name: embedAuthor })
        }

        //Embed description
        if(embedDesc){
            if(embedDesc.length > 4096) return interaction.editReply({ embeds: [{ author: { name: 'Максимальна кількість символів embed.description = 4096' }, color: 0xeb4c34 }], ephemeral: true, components: []}) //Return an error if embed description is too long
            embed.setDescription(embedDesc.replaceAll(`!n`, `\n`)) //Replace every '!n' with '\n' (Break lines)
        }

        //Color
        if(embedColor) embed.setColor(embedColor) //Set color if specified (By default it uses some kind of grey)
        
        if(embedFooter && embedFooter.length > 2048) return interaction.editReply({ embeds: [{ author: { name: 'Макимальна кількість символів embed.footer = 2048' }, color: 0xeb4c34 }], ephemeral: true, components: []}) //Return an error if embed footer is too long
        if(embedFooter && embedFooterIcon && embedFooterIcon.contentType.startsWith('image')){ //Check if footer is specified. If footer icon also was specified, and it's an image, put it as footer icon
                embed.setFooter({ text: embedFooter, iconURL: embedAuthorIcon.url })
        }else{ //If image is not corrent, just set an author
            if(embedFooter) embed.setFooter({ text: embedFooter })
        }

        //Embed image
        if(embedImage && embedImage.contentType.startsWith('image')) embed.setImage(embedImage.url) //If image was specified, and it's type is correct - set it as EMBED IMAGE
        if(embedThumbnail && embedThumbnail.contentType.startsWith('image')) embed.setThumbnail(embedThumbnail.url) //Same with thumbnail (Smaller image in embed's corner)

        if(Object.keys(embed.data).length !== 0) message.embeds = [embed] //If embed is present, attach it to the final message
        else message.embeds = [] //if not, embeds will be empty

        let uni = Math.floor(Date.now() / 1000) //Random number to track it later in collector

        const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
            .setLabel('Натисніть щоб відправити повідомлення')
            .setStyle(ButtonStyle.Success)
            .setCustomId('echo_' + uni)
        ) //Create button to send 
        message.components = [row] //Attach button to final message

        await interaction.editReply(message) //Edit pending message with created one
        .catch(async err => { return await interaction.editReply({ embeds: [{ author: { name: 'Виникла помилка при формуванні повідомлення. Перевірте правильність данних.' }, color: 0xeb4c34 }], ephemeral: true, components: []}) }) //Return error if something went wrong
        message.components = []

        const filter = i => i.customId === `echo_${uni}` && i.user.id === interaction.user.id; //Filter for collector
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000, max: 1 }); //Collector itself

        collector.on('collect', async (c) => {
            //If specified "author" is "server", send it as an webhook
            if(options.getString('author') === 'server'){
                if(!interaction.guild.members.me.permissionsIn(channel).has(PermissionFlagsBits.ManageWebhooks)){
                    return await interaction.editReply({ content: '', embeds: [{ author: { name: 'Не маю прав щоб керувати WebHook' }, color: 0xeb4c34 }], ephemeral: true, components: []}) 
                    //Return if bot doesn't have permissions to manage webhooks
                }
                const webhooks = await channel.fetchWebhooks(); //Fetch all webhooks in the channel
                let webhook = webhooks.find(wh => wh.name === `Kazak echo`); //Find webhook with specified name
                if(!webhook) webhook = await channel.createWebhook({ //If not found, create one
                    name: 'Kazak echo',
                    avatar: interaction.client.user.avatarURL(),
                })
    
                message.username = interaction.guild.name //Also set username to the server's name
                message.avatarURL = await interaction.guild.iconURL({ dynamic: true }) //Also set message author avatar (webhook avatar) as server avatar
    
                await webhook.send(message) //Send webhook
                .then(async() => {
                    await interaction.editReply({ content: '', embeds: [{ author: { name: 'Повідомлення відправлено' }, color: 0x344feb, description: `Повідомлення було відправлено в канал ${channel} від імені Серверу.` }], ephemeral: true, components: [] })
                    //Success message if sent
                })
                .catch(async err => {
                    //Error message if something went wrong
                    console.error(err)
                    return await interaction.editReply({ content: '', embeds: [{ author: { name: 'Виникла помилка' }, color: 0xeb4c34 }], ephemeral: true, components: []})
                })
            }else{
                await channel.send(message) //Send message to previously specified channel
                .then(async() => {
                    //Success message if sent
                    await interaction.editReply({ content: '', embeds: [{ author: { name: 'Повідомлення відправлено' }, color: 0x9f34eb, description: `Повідомлення було відправлено в канал ${channel} від імені Бота.` }], ephemeral: true, components: [] })
                })
                .catch(async err => {
                    //Error message if something went wrong
                    console.error(err)
                    return await interaction.editReply({ content: '', embeds: [{ author: { name: 'Виникла помилка' }, color: 0xeb4c34 }], ephemeral: true, components: []})
                })
        }
        })

        //If collector is inactive, return error
        collector.on('end', async (collected) => {
            if(!collected.first()){
                interaction.followUp('Дія відмінена від нективності')
                return await interaction.editReply({ components: [] })
            }
        })

    }
}