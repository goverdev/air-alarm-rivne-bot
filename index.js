require('dotenv').config()
const TelegramBot = require('node-telegram-bot-api');
const EventSource = require('eventsource')

const AIR_ALARM_URL = 'https://alerts.com.ua/api/states/live/16';
const AIR_ALARM_STICKER = 'CAACAgIAAxkBAAIBHmT1tNto_GhOrhr48sn4LBCXFyvLAAJUMwACaQx5S_7Fy2XYZE7EMAQ';
const REPULSE_AIR_ALARM_STICKER = 'CAACAgIAAxkBAAIBHGT1tMMIaumsv-lXEMBu-mrcDPcKAAIUNgACa5JwS1X2Hl7ZVUcFMAQ';
// const CONTINUES_AIR_ALARM = 'CAACAgIAAxkBAAIBIGT1tPeVRHEmpeJT-2sTXE1FGdUiAAKhNAACNxVwS9SA7oepaTdrMAQ';


const bot = new TelegramBot(process.env.BOT_TOKEN, {polling: true});
const source = new EventSource(AIR_ALARM_URL, {headers: {'X-API-Key': process.env.ALARM_API_TOKEN}});

bot.on('message', (msg) => {
    console.log({ msg })
    const chatId = msg.chat.id;

    // send a message to the chat acknowledging receipt of their message
    bot.sendMessage(chatId, 'Received your message');
});

bot.on('my_chat_member', (msg) => {
    const { new_chat_member, old_chat_member, chat } = msg;
    const chatId = chat.id;
    console.log({ msg })

    if (new_chat_member.status === 'administrator' && new_chat_member.user.username === 'air_alarm_rivne_bot') {
        // Bot added to the channel
        try {
            source.addEventListener('update', ({data}) => {
                console.log('update', { data });
                if (data.alert) {
                    return bot.sendSticker(chatId, AIR_ALARM_STICKER);
                }
                if (!data.alert) {
                    return bot.sendSticker(chatId, REPULSE_AIR_ALARM_STICKER);
                }
            })

        } catch (err) {
            return console.error(err)
        }
    }
    if (new_chat_member.status === 'left' && new_chat_member.user.username === 'air_alarm_rivne_bot') {
        // Bot removed from the channel
        try {
            return source.removeEventListener('update', () => {
                console.log(`Removed listener for the ${chatId} chat.`)
            })

        } catch (err) {
            return console.error(err)
        }
    }
})

console.log('Air alarm bot started...')
