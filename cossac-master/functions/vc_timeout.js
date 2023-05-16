var timeouts = {}

module.exports = async function (newVoiceState, oldVoiceState, client) {
    let privates = client.privates //Requries a privates from client
    for (let i in privates){ //Loops throught every private 
        if(oldVoiceState.channel && oldVoiceState.channel.id === privates[i]){ //If user left someone's private channel
            if(oldVoiceState.channel.members.size === 0){  //Checks user's joined to this channel, if it's 0
                timeouts[privates[i]] = setTimeout(function(){ //Create an timeout 
                    let channel = newVoiceState.guild.channels.cache.get(privates[i]) //Get channel
                    if(channel) require('../functions/vc_delete.js')({id: i.split('_')[1]}, channel, client) //If channel is still exist execute function that will delete it
                    clearTimeout(privates[i]) //stop this timeout
                    delete timeouts[privates[i]] //delete this timeout
                }, 60000)
            }
        }else if(newVoiceState.channel && newVoiceState.channel.id === privates[i]){ //If user left someone's private channel
            //User joined VC
            if(timeouts[privates[i]]){ //If there's a timeout for this channel 
                clearTimeout(timeouts[privates[i]]) //stop timeout
                delete timeouts[privates[i]] //delete timeout
            }
        }
    }
};