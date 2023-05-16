const log = require('../functions/log.js') //Require log function

module.exports = {
    name: 'messageDelete',
    once: false,
    async execute (message, client) {
        await log('msgDelete', client, { message }) //Execute the function
}}