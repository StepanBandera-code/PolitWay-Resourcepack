const { QuickDB } = require('quick.db')
const db = new QuickDB().table('votes')
const voteCd = new Set()
const wait = require('node:timers/promises').setTimeout;

module.exports = {
    id: "vote_",
    async execute(interaction){
        let embed = interaction.message.embeds[0].data
        if(!embed){
            console.error('Embed does not exist on vote')
            interaction.message.delete()
            return await interaction.reply({ content: 'З цим голосування щось не так, спробуйте перестворити його', ephemeral: true })
        }
        let vote = await db.get(embed.footer.text)
        if(!vote){
            console.error('Vote does not exist')
            interaction.message.delete()
            return await interaction.reply({ content: 'Цього голосування більше не їснує', ephemeral: true })
        }

        if(voteCd.has(interaction.user.id)) await wait(1500)

        for (let i in vote.options){
            if(vote.options[i].value.includes(interaction.user.id)){
                vote.options[i].value = vote.options[i].value.filter(value => value !== interaction.user.id)
            }
        }
        
        let selected = (interaction.customId.split('_')[1] - 1)
        vote.options[selected].value.push(interaction.user.id)
        await db.set(embed.footer.text, vote)

        const allVotes = vote.options.reduce((acc, curr) => acc + curr.value.length, 0)

        embed.description = vote.options.map((o, index) => `**${index+1}.** ${o.name} (${o.value.length} | ${(o.value.length / allVotes * 100).toFixed(0)}%)`).join(`\n`)  + `\n\nУсього голосів: ${allVotes}`

        interaction.message.edit({ embeds: interaction.message.embeds })

        await interaction.reply({ content: 'Ваш голос зараховано', ephemeral: true })

        voteCd.add(interaction.user.id);
        setTimeout(() => {
            voteCd.delete(interaction.user.id)
        }, 1500)
    }
}