const { MessageType } = require("@adiwajshing/baileys")

async function handler(m, { command }) {
    command = command.toLowerCase()
    this.anonymous = this.anonymous ? this.anonymous : {}
    switch (command) {
        case 'next':
        case 'leave': {
            let room = Object.values(this.anonymous).find(room => room.check(m.sender))
            if (!room) throw 'You are not currently in anonymous chat'
            m.reply('Ok')
            let other = room.other(m.sender)
            if (other) this.sendMessage(other, 'Partner leaves chat', MessageType.text)
            delete this.anonymous[room.id]
            if (command === 'leave') break
        }
        case 'start': {
            if (Object.values(this.anonymous).find(room => room.check(m.sender))) throw 'You are still in the anonymous chat'
            let room = Object.values(this.anonymous).find(room => room.state === 'WAITING' && !room.check(m.sender))
            if (room) {
                this.sendMessage(room.a, 'Find a partner!', MessageType.text)
                room.b = m.sender
                room.state = 'CHATTING'
                m.reply('Find a Partner!')
            } else {
                let id = + new Date
                this.anonymous[id] = {
                    id,
                    a: m.sender,
                    b: '',
                    state: 'WAITING',
                    check: function (who = '') {
                        return [this.a, this.b].includes(who)
                    },
                    other: function (who = '') {
                        return who === this.a ? this.b : who === this.b ? this.a : ''
                    },
                }
                m.reply('Waiting for partner...')
            }
            break
        }
    }
}
handler.help = ['start', 'leave', 'next']
handler.tags = 'anonymous'

handler.command = ['start', 'leave', 'next']
handler.private = true

module.exports = handler
