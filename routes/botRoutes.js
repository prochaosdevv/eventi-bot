const express = require('express');
const botRotues = express.Router();
const TelegramBot = require('node-telegram-bot-api');
// const RequestModel = require('../models/requests');
const token = process.env.TG_BOT_SECRET;
const bot = new TelegramBot(token, { polling: true });
const fs = require('fs');
const path = require('path');

var uniqueid = [];
const sourceFilePath = path.join(__dirname, '../config/master.json');


const nextField = {
    "eventName": "eventDescription",
    "eventDescription": "eventLocation",
    "eventLocation": "eventLink",
    "eventLink": "eventDate",
    "eventDate": "remindBefore",
    "remindBefore": "eventDateRemindInterval",
    "eventDateRemindInterval": "final",
}

const eventNameMsg = `Excellent! To begin, kindly share the name of the event for which you'd like to receive a reminder.`;
const eventNameMarkup = {
    reply_markup: {}
};

const eventDescriptionMsg = `Please provide a brief description of the event you are planning.`;
const eventDescriptionMarkup = {
    reply_markup: {}
};

const eventLocationMsg = `Great! Please provide a location of the event you are planning.`;
const eventLocationMarkup = {
    reply_markup: {}
};

const eventLinkMsg = `Awesome! Any link you want to add ?`;
const eventLinkMarkup = {
    reply_markup:
    {
        "inline_keyboard": [
            [
                {
                    text: "No Link",
                    callback_data: "/nolink",

                }
            ]
        ]
    }, parse_mode: 'html'

};

const eventDateMsg = `Great! When is this event happening?`;
const eventDateMarkup = {
    "reply_markup": {
        "inline_keyboard": [
            [
                {
                    text: "This event doesn't have any date yet.",
                    callback_data: "/nodate",

                }
            ]
        ]
    }, parse_mode: 'html'
};
const remindBeforeMsg = `Nice! When should I remind before the event?`;
const remindBeforeMsgMarkup = {
    reply_markup: {
        remove_keyboard: true,
        selective: true,
    }
};
const eventDateRemindIntervalMsg = `Oh! You missed the date you want to add, how often should we remind you to set the date?`;
const eventDateRemindIntervalMarkup = {
    reply_markup: {
        remove_keyboard: true,
        selective: true,
    }
};
const nextMsg = {
    "eventName": eventDescriptionMsg,
    "eventDescription": eventLocationMsg,
    "eventLocation": eventLinkMsg,
    "eventLink": eventDateMsg,
    "eventDate": remindBeforeMsg,
    "remindBefore": eventDateRemindIntervalMsg,
    "eventDateRemindInterval": null
}

const nextMmarkup = {
    "eventName": eventDescriptionMarkup,
    "eventDescription": eventLocationMarkup,
    "eventLocation": eventLinkMarkup,
    "eventLink": eventDateMarkup,
    "eventDate": remindBeforeMsgMarkup,
    "remindBefore": eventDateRemindIntervalMarkup,
    "eventDateRemindInterval": null
}

botRotues.get('/', async (req, res) => {
    console.log("request received");
    bot.onText(/\/start/, async (msg) => {
        const chatId = msg.chat.id;
console.log(chatId + msg.message_id);
console.log(!uniqueid.includes(chatId + msg.message_id));
        if (!uniqueid.includes(chatId + msg.message_id)) {

            bot.sendMessage(chatId, 'Welcome to the Event Reminder Wizard! ✨ To conjure up a reminder, use the magic words: /setreminder. Let the enchantment begin!', {
                "reply_markup": {
                    "inline_keyboard": [
                        [
                            {
                                text: "Set Reminder",
                                callback_data: "/setreminder",

                            },
                            {
                                text: "Delete Reminder",
                                callback_data: "/deletereminder",

                            },
                        ]
                    ]
                }, parse_mode: 'html'
            });
            uniqueid.push(chatId + msg.message_id)
        }
    })


    bot.onText(/\/setreminder/, async (msg) => {
        const chatId = msg.chat.id;
        if (!uniqueid.includes(chatId + msg.message_id)) {
            console.log("her");
            setreminder(chatId)
            uniqueid.push(chatId + msg.message_id)
        }
    })

    bot.on('callback_query', async function onCallbackQuery(callbackQuery) {

        const chatId = callbackQuery.message.chat.id;
        if (!uniqueid.includes(chatId + callbackQuery.message.message_id)) {

            if (callbackQuery.data == "/setreminder") {
                setreminder(chatId)
            }
            if (callbackQuery.data == "/nolink") {
                moveForward(chatId);
                // bot.answerCallbackQuery(callbackQuery.message.id);
                bot.editMessageReplyMarkup(JSON.stringify({ // Added JSON.stringify()
                    inline_keyboard: [[]]
                })
                    , {
                        chat_id: chatId,
                        message_id: callbackQuery.message.message_id
                    })

            }

            if (callbackQuery.data == "/nodate") {
                moveForward(chatId);
                // bot.answerCallbackQuery(callbackQuery.message.id);
                bot.editMessageReplyMarkup(JSON.stringify({ // Added JSON.stringify()
                    inline_keyboard: [[]]
                })
                    , {
                        chat_id: chatId,
                        message_id: callbackQuery.message.message_id
                    })

            }
            uniqueid.push(chatId + callbackQuery.message.message_id)
        }
    })

    bot.on('message', async (msg) => {
        const chatId = msg.chat.id;
        const text = msg.text;
        if (!uniqueid.includes(chatId + msg.message_id)) {

            if (text !== "/setreminder" && text !== "/start" && text !== "/nolink" && text !== "/nodate") {
                updateData(chatId, text)
                uniqueid.push(chatId + msg.message_id)

            }
        }

    })

})

// Utils Fnction
function moveForward(chatId) {
    const destination = path.join(__dirname, `../chats/${chatId}.json`);
    const content = fs.readFileSync(destination, 'utf-8');
    let _parseContent = JSON.parse(content)
    let _currentField  = _parseContent.currentField ; 
    _parseContent.currentField = nextField[_currentField];
    // console.log(_parseContent);
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.writeFileSync(destination, JSON.stringify(_parseContent));

    bot.sendMessage(chatId, nextMsg[_currentField], nextMmarkup[_currentField]);

}

// function setNoLink(chatId){
//     const destination = path.join(__dirname, `../chats/${chatId}.json`) ; 
//     const content = fs.readFileSync(destination, 'utf-8');
//     let _parseContent = JSON.parse(content)      
//     _parseContent.currentField =  nextField[_parseContent.currentField];
//     console.log(_parseContent); 
//     fs.mkdirSync(path.dirname(destination), { recursive: true });
//     fs.writeFileSync(destination, JSON.stringify(_parseContent));

//     bot.sendMessage(chatId, nextMsg[_parseContent.currentField],nextMmarkup[_parseContent.currentField]); 

// }

function setreminder(chatId) {
    const destinationFilePath = path.join(__dirname, `../chats/${chatId}.json`);
    createChatFile(chatId, destinationFilePath);
    bot.sendMessage(chatId, eventNameMsg, eventNameMarkup);
}

async function updateData(chatId, data) {
    const destination = path.join(__dirname, `../chats/${chatId}.json`);
    const content = fs.readFileSync(destination, 'utf-8');
    let _parseContent = JSON.parse(content);
    // console.log(_parseContent);
    let _currentField = _parseContent.currentField
    if (_currentField == "final") {
        sendFinal(chatId, _parseContent)
    }
    else {
        _parseContent[_currentField] = data;
        // console.log(_currentField);
        // nextField[_currentField]
        if (nextField[_currentField] == "eventDateRemindInterval") {
            
            if (_parseContent.eventDate) {
                _parseContent.currentField = "final";
            }
            else {
                _parseContent.currentField = nextField[_currentField];
            }

        }
        else {
            _parseContent.currentField = nextField[_currentField];
        }
        // console.log(_parseContent);
        fs.mkdirSync(path.dirname(destination), { recursive: true });
        fs.writeFileSync(destination, JSON.stringify(_parseContent));
        if (nextField[_currentField] == "eventDateRemindInterval") {
            if (_parseContent.eventDate) {
                sendFinal(chatId, _parseContent)
            }
            else {
                bot.sendMessage(chatId, nextMsg[_currentField], nextMmarkup[_currentField]);
            }
        }
        else if (nextField[_currentField] == "final") {
            sendFinal(chatId, _parseContent)
        }
        else {
            bot.sendMessage(chatId, nextMsg[_currentField], nextMmarkup[_currentField]);
        }

    }

}

function sendFinal(chatId, _parseContent) {
    const text = `Great!! You just completed the event details. Please cofirm below \n\nEvent Name: ${_parseContent.eventName}\nEvent Description: ${_parseContent.eventDescription}\nEvent Location: ${_parseContent.eventLocation}\nEvent Link: ${_parseContent.eventLink ? _parseContent.eventLink : `NA`}\nEvent Date: ${_parseContent.eventDate ? _parseContent.eventDate : `NA`}\nReminder: ${_parseContent.remindBefore}\n${!_parseContent.eventDate ? `Event Date Reminder: ${_parseContent.eventDateRemindInterval}` : ``} 
    `;
    console.log(text);
    bot.sendMessage(chatId, text)
}

async function createChatFile(chatId, destination) {

    try {
        const content = fs.readFileSync(sourceFilePath, 'utf-8');
        let _parseContent = JSON.parse(content)
        _parseContent.chatId = chatId;
        _parseContent.currentField = "eventName";
        fs.mkdirSync(path.dirname(destination), { recursive: true });
        fs.writeFileSync(destination, JSON.stringify(_parseContent))

    } catch (err) {
        console.error('Error checking file existence:', err.message);
        // You can choose to continue the code here or throw the error if needed
        return false;

    }
}

module.exports = botRotues; // Export the router
