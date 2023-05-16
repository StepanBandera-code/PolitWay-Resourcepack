const log = require('../functions/log.js') //Require log function

module.exports = {
    name: 'messageUpdate',
    once: false,
    async execute (oldMessage, newMessage, client) {
        await log('msgUpdate', client, { oldMessage, newMessage }) //Execute the function
}}