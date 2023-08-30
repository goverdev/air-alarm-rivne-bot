require('dotenv').config()
const TelegramBot = require('node-telegram-bot-api');
const EventSource = require('eventsource')

const AIR_ALARM_URL = 'https://alerts.com.ua/api/states/live/16';
const AIR_ALARM_STICKER = 'CAACAgIAAxkBAAPtZO5Euotz0NUe9M3UTT3TsNL5iXgAAlQzAAJpDHlL_sXLZdhkTsQwBA';
const REPULSE_AIR_ALARM_STICKER = 'CAACAgIAAxkBAAPvZO5FCv0jHFANLQquizmyK9UrwOwAAhQ2AAJrknBLVfYeXtlVRwUwBA';
// const CONTINUES_AIR_ALARM = 'CAACAgIAAxkBAAPwZO5FN7sc2NxClO5OjFgFCPdTEY4AAqE0AAI3FXBL1IDuh6lpN2swBA';


const bot = new TelegramBot(process.env.BOT_TOKEN, {polling: true});
const source = new EventSource(AIR_ALARM_URL, {headers: {'X-API-Key': process.env.ALARM_API_TOKEN}});

bot.onText('\/echo', ({chat}) => {
    bot.sendMessage(chat.id, 'Bot is working...');
});

bot.on('my_chat_member', (msg) => {
    const { new_chat_member, old_chat_member, chat } = msg;
    const chatId = chat.id;
    console.log({ msg })

    if (new_chat_member.status === 'administrator' && new_chat_member.user.username === 'air_alarm_rivne_bot') {
        // Bot added to the channel
        try {
            source.addEventListener('update', ({data}) => {
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
