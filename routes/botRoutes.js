const express = require('express');
const botRotues = express.Router();
const TelegramBot = require('node-telegram-bot-api');
// const RequestModel = require('../models/requests');
const token = process.env.TG_BOT_SECRET;
const bot = new TelegramBot(token, { polling: true });
const fs = require('fs');
const path = require('path');
const { SEVEN_DAY, ONE_DAY, ONE_HOUR } = require('../config/constants');
const { log } = require('console');

var uniqueid = [];
const sourceFilePath = path.join(__dirname, '../config/master.json');


const nextField = {
    "eventName": "eventChain",
    "eventChain": "eventLink",
    "eventLink": "eventTwitter",
    "eventTwitter": "communityLink",
    "communityLink": "eventDate",
    "eventDate": "remindBefore",
    "remindBefore": "eventDateRemindInterval",
    "eventDateRemindInterval": "final",
}

const REMINDER_TEXT = {
    [SEVEN_DAY]: "7 days before launch",
    [ONE_DAY]: "One day before launch",
    [ONE_HOUR]: "1 hour before launch"
}

const DATE_REMINDER_TEXT = { 
    [ONE_DAY]: "Every Day",
    [ONE_HOUR]: "Every Hour"
}

const eventNameMsg = `Excellent! To begin, kindly share the name of the project for which you'd like to set the reminder.`;
const eventNameMarkup = {
    reply_markup: {}
};
const eventChainMsg = `Great! What chain is it on ?`;
const eventChainMarkup = {
    reply_markup: {}
};

const eventLinkMsg = `Awesome! What is the website link of the project?`;
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

const eventTwitterMsg = `Please provide the twitter link of the project.`;
const  eventTwitterMarkup = {
    reply_markup: {}
};

const communityLinkMsg = `Great! Please provide the telegram or discord link of the project.`;
const communityLinkMarkup = {
    reply_markup: {}
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
    "reply_markup": {
        "inline_keyboard": [
            [
                {
                    text: "7 days before launch",
                    callback_data: `remindBefore_${SEVEN_DAY}`,
                }
            ],
            [
                {
                    text: "1 day before launch",
                    callback_data: `remindBefore_${ONE_DAY}`,
                }
            ],
            [
                {
                    text: "1 hour before launch",
                    callback_data: `remindBefore_${ONE_HOUR}`,
                }
            ]
        ]
    }, parse_mode: 'html'
};
const eventDateRemindIntervalMsg = `Oh! You missed the date you want to add, how often should we remind you to set the date?`;
const eventDateRemindIntervalMarkup = {
    "reply_markup": {
        "inline_keyboard": [
            [
                {
                    text: "Every Day",
                    callback_data: `reminderDate_${ONE_DAY}`,
                }
            ],
            [
                {
                    text: "Every hour",
                    callback_data: `reminderDate_${ONE_HOUR}`,
                }
            ]
        ]
    }, parse_mode: 'html'
};

const nextMsg = {
    "eventName": eventChainMsg,
    "eventChain": eventLinkMsg,
    "eventLink": eventTwitterMsg,
    "eventTwitter": communityLinkMsg,
    "communityLink": eventDateMsg,
    "eventDate": remindBeforeMsg,
    "remindBefore": eventDateRemindIntervalMsg,
    "eventDateRemindInterval": null
}

const nextMmarkup = {
    "eventName": eventChainMarkup,
    "eventChain": eventLinkMarkup,
    "eventLink": eventTwitterMarkup,
    "eventTwitter": communityLinkMarkup,
    "communityLink": eventDateMarkup,
    "eventDate": remindBeforeMsgMarkup,
    "remindBefore": eventDateRemindIntervalMarkup,
    "eventDateRemindInterval": null
}

botRotues.get('/', async (req, res) => {
    console.log("request received");
    bot.onText(/\/start/, async (msg) => {
        const chatId = msg.chat.id;
         
        
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
                bot.editMessageReplyMarkup(JSON.stringify({ // Added JSON.stringify()
                    inline_keyboard: [[]]
                })
                    , {
                        chat_id: chatId,
                        message_id: callbackQuery.message.message_id
                    })

            }

            if(callbackQuery.data == "/continue_reminder"){
                moveForward(chatId); 

            }

            if (callbackQuery.data == "/nodate") {
                moveForward(chatId); 
                bot.editMessageReplyMarkup(JSON.stringify({ // Added JSON.stringify()
                    inline_keyboard: [[]]
                })
                    , {
                        chat_id: chatId,
                        message_id: callbackQuery.message.message_id
                    })

            }

            if (callbackQuery.data.includes("remindBefore")) {
                console.log(callbackQuery.data);
                console.log(callbackQuery.data.replace("remindBefore_",""));
                setRemindBefore(chatId, callbackQuery.data.replace("remindBefore_",""))
            }
            
            if (callbackQuery.data.includes("reminderDate")) {
                setReminderDateInterval(chatId,callbackQuery.data.replace("reminderDate_",""))
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

    res.send({status: "OK"})

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

function setRemindBefore(chatId,seconds){
    const destination = path.join(__dirname, `../chats/${chatId}.json`) ; 
    const content = fs.readFileSync(destination, 'utf-8');
    let _parseContent = JSON.parse(content)    
    // console.log(_parseContent.remindBefore);
    // console.log(seconds);
    _parseContent.remindBefore = _parseContent.remindBefore ? [seconds , ..._parseContent.remindBefore] : [seconds];
    console.log(_parseContent.remindBefore);
        if(_parseContent.remindBefore.includes(SEVEN_DAY) && _parseContent.remindBefore.includes(ONE_DAY) && _parseContent.remindBefore.includes(ONE_HOUR)){
            _parseContent.currentField =  nextField[_parseContent.currentField];
            }       
    // console.log(_parseContent); 
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.writeFileSync(destination, JSON.stringify(_parseContent));
    console.log(_parseContent.remindBefore.includes(ONE_DAY));
    
    if(!_parseContent.remindBefore.includes(SEVEN_DAY) || !_parseContent.remindBefore.includes(ONE_DAY) || !_parseContent.remindBefore.includes(ONE_HOUR)){

    let _keybArray = [] ; 
    if(!_parseContent.remindBefore.includes(SEVEN_DAY)){
        _keybArray.push([{
            text: "7 days before launch",
            callback_data: `remindBefore_${SEVEN_DAY}`,
        }])
    }
    if(!_parseContent.remindBefore.includes(ONE_DAY)){
        _keybArray.push([{
            text: "One day before launch",
            callback_data: `remindBefore_${ONE_DAY}`,
        }])
    }
    if(!_parseContent.remindBefore.includes(ONE_HOUR)){
        _keybArray.push([{
            text: "One hour before launch",
            callback_data: `remindBefore_${ONE_HOUR}`,
        }])
    }
    _keybArray.push([{
        text: "No",
        callback_data: `/continue_reminder`,
    }])

    console.log(_keybArray);
    bot.sendMessage(chatId, "Great! Do you like to add more reminder?",{
        "reply_markup": {
            "inline_keyboard": _keybArray
        }, parse_mode: 'html'
    }); 
    return;
}
    bot.sendMessage(chatId, nextMsg[_parseContent.currentField],nextMmarkup[_parseContent.currentField]); 
}

function setReminderDateInterval(chatId,seconds){
    const destination = path.join(__dirname, `../chats/${chatId}.json`) ; 
    const content = fs.readFileSync(destination, 'utf-8');
    let _parseContent = JSON.parse(content)      
    _parseContent.currentField =  nextField[_parseContent.currentField];
    _parseContent.eventDateRemindInterval = seconds
    console.log(_parseContent); 
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.writeFileSync(destination, JSON.stringify(_parseContent));
    sendFinal(chatId,_parseContent)
    // bot.sendMessage(chatId, nextMsg[_parseContent.currentField],nextMmarkup[_parseContent.currentField]); 
    
}



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
    let _reminder = [] ;
    console.log(_parseContent.remindBefore);
    _parseContent.remindBefore.map((v,i) => _reminder.push(REMINDER_TEXT[v]))
    console.log(_reminder);
    let text = `Great!! You just completed the event details. Please cofirm below \n\n` ;
    text += `Project Name: ${_parseContent.eventName}\n`
    text += `Project Chain: ${_parseContent.eventChain}\n`
    text += `Event Date: ${_parseContent.eventDate ? _parseContent.eventDate : `NA`}\n`
    text += `Reminder: ${_reminder.join(',')}\n`
    text += `${!_parseContent.eventDate ? `Event Date Reminder: ${DATE_REMINDER_TEXT[_parseContent.eventDateRemindInterval]}` : ``}`;
    let communityText = '👥Discord' ;
    let _communityLink = _parseContent.communityLink.toLowerCase() ; 
    if(_communityLink.includes("t.me") || _communityLink.includes("telegram") ){
        communityText = '👥Telegram ' ;
    }
    const _markup = {
    reply_markup:
    {
        "inline_keyboard": [
            [
                {
                    text: "💻Website",
                    url: _parseContent.eventLink,
                },
                {
                    text: "🐦Twitter",
                    url: _parseContent.eventTwitter
                },
                {
                    text: communityText,                    
                    url: _parseContent.communityLink

                }
                
            ],
            [
                {
                    text: "✅ Confirm",                    
                    callback_data: `confirm_${_parseContent.requestId}`

                }
            ]
        ]
    }, parse_mode: 'html'

};
 
    console.log(text);
    bot.sendMessage(chatId, text, _markup)
}

async function createChatFile(chatId, destination) {

    try {
        const content = fs.readFileSync(sourceFilePath, 'utf-8');
        let _parseContent = JSON.parse(content)
        _parseContent.chatId = chatId;
        _parseContent.currentField = "eventName";
        _parseContent.requestId = generateRandomString(8);
        
        fs.mkdirSync(path.dirname(destination), { recursive: true });
        fs.writeFileSync(destination, JSON.stringify(_parseContent))

    } catch (err) {
        console.error('Error checking file existence:', err.message);
        // You can choose to continue the code here or throw the error if needed
        return false;

    }
}



function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';

    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        result += characters.charAt(randomIndex);
    }

    return result;
}

module.exports = botRotues; // Export the router
