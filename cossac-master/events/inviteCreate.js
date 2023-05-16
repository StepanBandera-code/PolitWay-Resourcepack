const { update } = require('../functions/trackInvites.js')

module.exports = {
    name: 'inviteCreate',
    once: false,
    async execute (invite) {
        update(invite)
}}