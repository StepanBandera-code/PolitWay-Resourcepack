const { SlashCommandBuilder, ButtonBuilder, ActionRowBuilder, PermissionsBitField, EmbedBuilder, ButtonStyle } = require('discord.js')
const { QuickDB } = require('quick.db')
const db = new QuickDB()

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Інформація про бота'),
    async execute(interaction) {
        const lobbies = await db.table('lobbies');
        const log = await db.table('logs');
        const counters = await db.table('counters');
        const misc = await db.table('misc')

        const row = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setLabel('Сервер підтримки')
                .setURL(`https://discord.gg/meNVABVA8c`)
                .setStyle(ButtonStyle.Link),
            new ButtonBuilder()
                .setLabel('Додати бота на сервер')
                .setURL(`https://discord.com/oauth2/authorize?client_id=797395030851059713&permissions=1635242208510&scope=bot%20applications.commands`)
                .setStyle(ButtonStyle.Link)
        );

        if(interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)){
            let embed = new EmbedBuilder()
            .setAuthor({ name: `Слава Україні!`, iconURL: `https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Flag_of_Ukraine.svg/800px-Flag_of_Ukraine.svg.png?20100406171642` })
            .setDescription(`**Це - Козак, перший повністю безкоштовний, україномовний бот з відкритим кодом.**\nМи помітили що Ви є адміністратором, тому відображаємо інформацію яка буде корисна для Вас.`)
            .addFields(
                { name: 'Приватні голосові кімнати', value: 'Ви можете добавити можливість для своїх участників створювати свої закриті голосові кімнати у себе на сервері.\nДля цього створіть новий голосовий канал, та добавте його в якості "Лоббі" через команду `/prefs vclobby #канал`' },
                { name: 'Сповіщення про події', value: 'Ми можемо відправляти сповіщення про окремі типи подій в спеціалізований для цього канал.\nВстановіть його через `/prefs log channel #канал`\nНе забудьте увімкнути окремі типи через `/prefs log switch`' },
                { name: 'Лічильник участників онлайн', value: 'Ми будемо автоматично оновлювати назву Категорії або Голосового каналу в залежності від онлайну на сервері\nВстановіть це через `/prefs counter set #канал`' }
            )
            embed.addFields({ name: 'Більше інформації на нашому GitHub', value: `**[Посилання на GitHub](${require('../package.json').homepage})**`})
            .setFooter({ text: `${interaction.client.user.tag} | Дякуємо за Вашу підтримку!`, iconURL: `${interaction.client.user.avatarURL()}` })
            .setColor(`Green`)
            await interaction.reply({ embeds: [embed], components: [row] })
        }else{
            let embed = new EmbedBuilder()
            .setAuthor({ name: `Слава Україні!`, iconURL: `https://upload.wikimedia.org/wikipedia/commons/thumb/4/49/Flag_of_Ukraine.svg/800px-Flag_of_Ukraine.svg.png?20100406171642` })
            .setDescription(`**Це - Козак, перший повністю безкоштовний, україномовний бот з відкритим кодом.**`)
            .addFields(
                { name: 'Стало нудно? Розважальні команди!', value: '`/8ball` - запитайте мене щось і ми начаклуємо відповідь!\n`/dice` - створіть стіл для гральних кубиків, та знайдіть серед вас найбільш везучого!\n`/dog` і `/cat` - фотографії тваринок!' },
                { name: 'Бажає запитати думку спільноти?', value: 'Створіть голосування з допомогою команди `/vote`' }
            )
            .setFooter({ text: `${interaction.client.user.tag} | Дякуємо за Вашу підтримку!`, iconURL: `${interaction.client.user.avatarURL()}` })
            .setColor(`Green`)

            let lobby = interaction.guild.channels.cache.get(await lobbies.get(interaction.guild.id))
            if(lobby) embed.addFields({ name: `Ви можете створити свій особистий голосовий канал на цьому сервері`, value: `Для цього просто під'єднайтесь до **${lobby}**\nВи також можете контролювати ним через команду\`/privates\`` })

            let prefix = await misc.get(`${interaction.guild.id}.prefix`)
            if(prefix) embed.addFields({ name: `Користувацькі ролі!`, value: 'Скористайтесь `/color`, щоб побачити усю магію цього серверу!' })

            embed.addFields({ name: 'Більше інформації на нашому GitHub', value: `**[Посилання на GitHub](${require('../package.json').homepage})**`})

            await interaction.reply({ embeds: [embed], components: [row] })

        }
    }
}