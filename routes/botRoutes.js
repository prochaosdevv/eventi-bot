const express = require('express');
const botRotues = express.Router();
const fs = require('fs')
// const fs = require('fs').promises; 
const util = require('util');
// const fse = require('fs-extra');
const TelegramBot = require('node-telegram-bot-api');
const RequestModel = require('../models/requestsModel');
const token = process.env.TG_BOT_SECRET;
const bot = new TelegramBot(token, { polling: true });
const path = require('path');
const { SEVEN_DAY, ONE_DAY, ONE_HOUR, fieldMarkupsOne, fieldMarkupsTwo } = require('../config/constants');
const { log } = require('console');
const Calendar = require('telegram-inline-calendar');

// const readFileAsync = util.promisify(fs.readFile);

const calendar = new Calendar(bot, {
    date_format: 'DD-MM-YYYY',
    language: 'en'
});


const updateVariable = [];
var uniqueid = [];
const sourceFilePath = path.join(__dirname, '../config/master.json');

const { Extra, Markup } = require('telegraf');

// const botCal = new Telegraf(token);


const nextField = {
    "eventName": "eventChain",
    "eventChain": "eventPad",
    "eventPad": "eventLink",
    "eventLink": "eventTwitter",
    "eventTwitter": "communityLink",
    "communityLink": "eventDate",
    "eventDate": "remindBefore",
    // "eventTime": "remindBefore", 
    "remindBefore": "eventDateRemindInterval",
    "eventDateRemindInterval": "final",
}

const REMINDER_TEXT = {
    [SEVEN_DAY]: "Seven days before launch",
    [ONE_DAY]: "One day before launch",
    [ONE_HOUR]: "One hour before launch"
}

const DATE_REMINDER_TEXT = {
    [ONE_DAY]: "Every Day",
    [ONE_HOUR]: "Every Hour"
}


const eventNameMsg = `Excellent! To begin, kindly share the name of the project for which you'd like to set the reminder.`;
const eventNameMarkup = {
    reply_markup: {}
};

const eventPadMsg = `Where is it launching (e.g. Uniswap, Camelot, GemPad, etc)`;
const eventPadMarkup = {
    reply_markup: {}
};


const eventChainMsg = `Great! What chain is it on ?`;
const eventChainMarkup = {
    reply_markup: {}
};

const eventLinkMsg = `Awesome! What is the website link of the project?`;
// const  eventLinkMarkup = {
//     reply_markup: {}
// };
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
const eventTwitterMarkup = {
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

const communityLinkMsg = `Great! Please provide the telegram or discord link of the project.`;
const communityLinkMarkup = {
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

const eventDateMsg = `Great! When is this event happening? Please enter a date and time (MM/DD/YYYY HH:MM) EST:`;
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
//
const eventTimeMsg = `Great! At what time is this event happening? Please enter the time (e.g., 10:00 AM EST):`;
const eventTimeMarkup = {
    reply_markup: {}
};

//
const remindBeforeMsg = `Nice, When should I remind you before then event?`;
const remindBeforeMsgMarkup = {
    "reply_markup": {
        "inline_keyboard": [
            [
                {
                    text: REMINDER_TEXT[SEVEN_DAY],
                    callback_data: `remindBefore_${SEVEN_DAY}`,
                }
            ],
            [
                {
                    text: REMINDER_TEXT[ONE_DAY],
                    callback_data: `remindBefore_${ONE_DAY}`,
                }
            ],
            [
                {
                    text: REMINDER_TEXT[ONE_HOUR],
                    callback_data: `remindBefore_${ONE_HOUR}`,
                }
            ]
        ]
    }, parse_mode: 'html'
};
const eventDateRemindIntervalMsg = `Oh! You missed the date. How often do you want to be reminded to enter a date for this launch? (answer in amount of days (e.g. “2” for every 2 days)`;
const eventDateRemindIntervalMarkup = {
    reply_markup: {}
};
//      {
//     "reply_markup": {
//         "inline_keyboard": [
//             [
//                 {
//                     text: DATE_REMINDER_TEXT[ONE_DAY],
//                     callback_data: `reminderDate_${ONE_DAY}`,
//                 }
//             ],
//             [
//                 {
//                     text: DATE_REMINDER_TEXT[ONE_HOUR],
//                     callback_data: `reminderDate_${ONE_HOUR}`,
//                 }
//             ]
//         ]
//     }, parse_mode: 'html'
// };

const nextMsg = {
    "eventName": eventChainMsg,
    "eventChain": eventPadMsg,
    "eventPad": eventLinkMsg,
    "eventLink": eventTwitterMsg,
    "eventTwitter": communityLinkMsg,
    "communityLink": eventDateMsg,
    "eventDate": remindBeforeMsg,
    // "eventTime": remindBeforeMsg,
    "remindBefore": eventDateRemindIntervalMsg,
    "eventDateRemindInterval": null
}

const nextMmarkup = {
    "eventName": eventChainMarkup,
    "eventChain": eventPadMarkup,
    "eventPad": eventLinkMarkup,
    "eventLink": eventTwitterMarkup,
    "eventTwitter": communityLinkMarkup,
    "communityLink": eventDateMarkup,
    "eventDate": remindBeforeMsgMarkup,
    // "eventTime": remindBeforeMsgMarkup,
    "remindBefore": eventDateRemindIntervalMarkup,
    "eventDateRemindInterval": null
}



const editNextMsg = {
    "eventName": eventNameMsg,
    "eventChain": eventChainMsg,
    "eventPad": eventPadMsg,
    "eventLink": eventLinkMsg,
    "eventTwitter": eventTwitterMsg,
    "communityLink": communityLinkMsg,
    "eventDate": eventDateMsg,
    "remindBefore": remindBeforeMsg,
    "eventDateRemindInterval": null
}

const editNextMarkup = {
    "eventName": eventNameMarkup,
    "eventChain": eventChainMarkup,
    "eventPad": eventPadMarkup,
    "eventLink": eventLinkMarkup,
    "eventTwitter": eventTwitterMarkup,
    "communityLink": communityLinkMarkup,
    "eventDate": eventDateMarkup,
    "remindBefore": remindBeforeMsgMarkup,
    "eventDateRemindInterval": null
}


botRotues.get('/', async (req, res) => {
    // console.log("request received");
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
                                text: "List Reminders",
                                callback_data: "/listreminder",

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
            uniqueid.push(chatId + callbackQuery.message.message_id)

            if (callbackQuery.data == "/setreminder") {
                setreminder(chatId)
            }
            if(callbackQuery.data == "/listreminder"){
                // const chatId = msg.chat.id;
                const page = 0;
            
                try {
                   await showEvent(chatId , page ,false)
                } catch (error) { 
                    console.error(`Error handling /listreminder for chatId ${chatId}: ${error.message}`);
                    bot.sendMessage(chatId, 'Error fetching events. Please try again later.');
                }
            }
            if (callbackQuery.data == "/nolink") {
                bot.editMessageReplyMarkup(JSON.stringify({ // Added JSON.stringify()
                    inline_keyboard: [[]]
                })
                    , {
                        chat_id: chatId,
                        message_id: callbackQuery.message.message_id
                    })
                // sendNextMsg(chatId)
                moveForward(chatId, callbackQuery.message);

            }

            if (callbackQuery.data == "/continue_reminder") {

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
                console.log(callbackQuery.data.replace("remindBefore_", ""));
                setRemindBefore(chatId, callbackQuery.data.replace("remindBefore_", ""))
            }

            if (callbackQuery.data.includes("reminderDate")) {
                setReminderDateInterval(chatId, callbackQuery.data.replace("reminderDate_", ""))
            }

            
            if (callbackQuery.data.includes("delete_")) {
                const requestId = callbackQuery.data.split('_')[1];
                try {
                   
                    const eventDetails = await getEventDataByRequestId(chatId, requestId);
                    console.log("eventDetails", eventDetails)

                    if (!eventDetails) {
                        bot.sendMessage(chatId, 'Event not found. Please try again.');
                        return;
                    }

                    const eventName = eventDetails.eventName;
                    await deleteEventByRequestId(chatId, requestId);
                    const firstEightDigits = requestId.substring(0, 8);
                    bot.sendMessage(chatId, `Event deleted successfully with requestId ${firstEightDigits} and eventName ${eventName}`);

                } catch (error) {
                    console.error(`Error handling delete event for chatId ${chatId} and requestId ${requestId}: ${error.message}`);
                    bot.sendMessage(chatId, 'Error deleting event. Please try again later.');
                }

            }

            if (callbackQuery.data.includes("confirm")) {
                try {
                    const userEvents = await store_data_in_database(chatId);
                    if (userEvents) {
                        console.log('User Events:', userEvents);
                        let linksMarkup = [];
                        if (userEvents.eventLink) {
                            linksMarkup.push({
                                text: "💻Website",
                                url: userEvents.eventLink,
                            });
                        }
                        if (userEvents.eventTwitter) {
                            linksMarkup.push({
                                text: "🐦Twitter",
                                url: userEvents.eventTwitter
                            })
                        }
                        if (userEvents.communityLink) {
                            let communityText = '👥Discord';
                            let _communityLink = userEvents.communityLink.toLowerCase();
                            if (_communityLink.includes("t.me") || _communityLink.includes("telegram")) {
                                communityText = '👥Telegram ';
                            }
                            linksMarkup.push({
                                text: communityText,
                                url: userEvents.communityLink

                            })
                        }

                        bot.editMessageReplyMarkup(JSON.stringify({ // Added JSON.stringify()
                            inline_keyboard: [linksMarkup]
                        })
                            , {
                                chat_id: chatId,
                                message_id: callbackQuery.message.message_id
                            })
                        bot.sendMessage(chatId, 'Event Entry confirmed!');
                        const destinationFilePath = path.join(__dirname, `../chats/${chatId}.json`);
                        createChatFile(chatId, destinationFilePath, "stop");
                    }
                    else {
                        bot.sendMessage(chatId, 'Error confirming user events. Please try again later.');
                    }



                } catch (error) {
                    console.error('Error:', error);
                    bot.sendMessage(chatId, 'Error confirming user events. Please try again later.');
                }
            }

            if (callbackQuery.data.startsWith('/edit_')) {
                const eventIndex = parseInt(callbackQuery.data.split('_')[1]) - 1;
                console.log("eventIndex",eventIndex)

                const eventId = callbackQuery.data.split('_')[1];
                console.log("eventId",eventId)
                try {
                    await editEvent(chatId, eventId,1);
                } catch (error) {
                    console.error(`Error handling /edit_${eventId} for chatId ${chatId}: ${error.message}`);
                    bot.sendMessage(chatId, 'Error editing the event. Please try again later.');
                }
                
                bot.sendMessage(chatId, `You clicked the Edit button for event ${eventIndex + 1}`);
                //
              
            } 
       
        
            if (callbackQuery.data.startsWith('/nextfield_')) {
                const eventId = callbackQuery.data.split('_')[1];
                console.log("eventId ",eventId)
                try {
                    await editEvent(chatId, eventId,2);
                } catch (error) {
                    console.error(`Error handling /edit_${eventId} for chatId ${chatId}: ${error.message}`);
                    bot.sendMessage(chatId, 'Error editing the event. Please try again later.');
                }
                
            }      
            if (callbackQuery.data.startsWith('/prevfield_')) {
                const eventId = callbackQuery.data.split('_')[1];
                console.log("eventId ",eventId)
                try {
                    await editEvent(chatId, eventId,1);
                } catch (error) {
                    console.error(`Error handling /edit_${eventId} for chatId ${chatId}: ${error.message}`);
                    bot.sendMessage(chatId, 'Error editing the event. Please try again later.');
                }
                
            } 
        
            if (callbackQuery.data.startsWith('/editfield_')) {
                console.log("here")
                const { field, requestId } = extractFieldAndRequestId(callbackQuery.data);
              

                try {
      
                      askNextField(chatId, { field, requestId });
               } catch (error) {
                    console.error(`Error handling /edit_${field}_${requestId} for chatId ${chatId}: ${error.message}`);
                    bot.sendMessage(chatId, 'Error processing the request. Please try again later.');
              } 
               
                
            } 

           
                // else if (callbackQuery.data == '/switchfieldset') {
            //     handleSwitchFieldSet(chatId);
            // } else if (callbackQuery.data == '/pageinfo') {
            //     handlePageInfo(chatId);
            // }
            if (callbackQuery.data.includes('next_page_')) {
                const nextPage = parseInt(callbackQuery.data.split('_')[2]) || 1;
                console.log(nextPage);

                // bot.sendMessage(chatId, `/listreminder ${nextPage}`);
                await showEvent(chatId,nextPage,true,callbackQuery)
            }

            if (callbackQuery.data.includes('prev_page_')) {
                const prevPage = parseInt(callbackQuery.data.split('_')[2]) || 1;
                console.log(prevPage);

                // bot.sendMessage(chatId, `/listreminder ${nextPage}`);
                await showEvent(chatId,prevPage-1,true,callbackQuery)
            }

            

        }
    })

    bot.on('message', async (msg) => {
        const chatId = msg.chat.id;
        const text = msg.text;
        if (!uniqueid.includes(chatId + msg.message_id)) {

            if (text !== "/setreminder" && text !== "/start" && text !== "/nolink" && text !== "/nodate" && text !== "/listreminder") {
                updateData(chatId, text)
                uniqueid.push(chatId + msg.message_id)

            }
        }

    })

    res.send({ status: "OK" })

})

// function sendNextMsg(chatId) {
//     const destination = path.join(__dirname, `../chats/${chatId}.json`);
//     const content = fs.readFileSync(destination, 'utf-8');
//     let _parseContent = JSON.parse(content)
//     let _currentField  = _parseContent.currentField ;  
//     _parseContent.currentField = nextField[_currentField] ;
//     // console.log(_parseContent);
//     fs.mkdirSync(path.dirname(destination), { recursive: true });
//     fs.writeFileSync(destination, JSON.stringify(_parseContent));
//     bot.sendMessage(chatId, nextMsg[_currentField], nextMmarkup[_currentField]);

// }
// Utils Fnction

function moveForward(chatId, msg = null) {
    const destination = path.join(__dirname, `../chats/${chatId}.json`);
    const content = fs.readFileSync(destination, 'utf-8');
    let _parseContent = JSON.parse(content)
    let _currentField = _parseContent.currentField;
    // console.log(_parseContent);


    if (nextField[_currentField] == "eventDateRemindInterval") {
        if (_parseContent.eventDate) {
            sendFinal(chatId, _parseContent);
            return;
        }
        // else {
        //     _parseContent.currentField = nextField[_currentField];
        //     bot.sendMessage(chatId, nextMsg[_currentField], nextMmarkup[_currentField]);
        // }
    }

    // else{
    _parseContent.currentField = nextField[_currentField];
    bot.sendMessage(chatId, nextMsg[_currentField], nextMmarkup[_currentField]);
    // }
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.writeFileSync(destination, JSON.stringify(_parseContent));



}

function setRemindBefore(chatId, seconds) {
    const destination = path.join(__dirname, `../chats/${chatId}.json`);
    const content = fs.readFileSync(destination, 'utf-8');
    let _parseContent = JSON.parse(content)
    // console.log(_parseContent.remindBefore);
    // console.log(seconds);
    _parseContent.remindBefore = _parseContent.remindBefore ? [seconds, ..._parseContent.remindBefore] : [seconds];
    console.log(_parseContent.remindBefore);
    // if(_parseContent.remindBefore.includes(SEVEN_DAY) && _parseContent.remindBefore.includes(ONE_DAY) && _parseContent.remindBefore.includes(ONE_HOUR)){
    //     _parseContent.currentField =  nextField[_parseContent.currentField];

    //     }       
    // console.log(_parseContent); 
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.writeFileSync(destination, JSON.stringify(_parseContent));
    console.log(_parseContent.remindBefore.includes(ONE_DAY));

    if (!_parseContent.remindBefore.includes(SEVEN_DAY) || !_parseContent.remindBefore.includes(ONE_DAY) || !_parseContent.remindBefore.includes(ONE_HOUR)) {

        let _keybArray = [];
        if (!_parseContent.remindBefore.includes(SEVEN_DAY)) {
            _keybArray.push([{
                text: REMINDER_TEXT[SEVEN_DAY],
                callback_data: `remindBefore_${SEVEN_DAY}`,
            }])
        }
        if (!_parseContent.remindBefore.includes(ONE_DAY)) {
            _keybArray.push([{
                text: REMINDER_TEXT[ONE_DAY],
                callback_data: `remindBefore_${ONE_DAY}`,
            }])
        }
        if (!_parseContent.remindBefore.includes(ONE_HOUR)) {
            _keybArray.push([{
                text: REMINDER_TEXT[ONE_HOUR],
                callback_data: `remindBefore_${ONE_HOUR}`,
            }])
        }
        _keybArray.push([{
            text: "No, continue.",
            callback_data: `/continue_reminder`,
        }])

        console.log(_keybArray);
        bot.sendMessage(chatId, "Great! Would you like to add another reminder?", {
            "reply_markup": {
                "inline_keyboard": _keybArray
            }, parse_mode: 'html'
        });
        return;
    }

    moveForward(chatId)
    // bot.sendMessage(chatId, nextMsg[_parseContent.currentField],nextMmarkup[_parseContent.currentField]); 
}

function setReminderDateInterval(chatId, seconds) {
    const destination = path.join(__dirname, `../chats/${chatId}.json`);
    const content = fs.readFileSync(destination, 'utf-8');
    let _parseContent = JSON.parse(content)
    _parseContent.currentField = nextField[_parseContent.currentField];
    _parseContent.eventDateRemindInterval = seconds
    console.log(_parseContent);
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.writeFileSync(destination, JSON.stringify(_parseContent));
    sendFinal(chatId, _parseContent)
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
    else if (_currentField == "stop") {
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

    }
    else {
        if (_currentField == "eventDateRemindInterval") {
            _parseContent[_currentField] = data * 86400000;
        }
        else {
            if (_currentField == "eventLink" || _currentField == "eventTwitter" || _currentField == "communityLink") {
                if (!isLinkValid(data)) {
                    bot.sendMessage(chatId, "The link you shared is not valid, please share a valid link.(e.g. “https://google.com”)");
                    return;
                }
            }

            if (_currentField == "eventDate") {
                let _date = new Date(data);
                let _cdate = new Date();
                console.log(_date);
                if (_date == "Invalid Date" || _date < _cdate) {
                    bot.sendMessage(chatId, "The date you entered is not in requested format or is in the past.(e.g. MM/DD/YYYY)");
                    return;
                }

                data = (_date.getMonth() + 1) + "/" + _date.getFullYear() + "/" + _date.getFullYear() + " " + (_date.getHours() < 10 ? `0${_date.getHours()}` : _date.getHours()) + ":" + (_date.getMinutes() < 10 ? `0${_date.getMinutes()}` : _date.getMinutes());
                console.log(data);
                // data = _date.toString();
            }
            _parseContent[_currentField] = data;
        }
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
            // if(nextField[_currentField] == "eventDate"){
            //     botCal.command('setdate', (ctx) => {
            //         ctx.reply('Please select a date:', Markup.inlineKeyboard([
            //           Markup.calendarButton('📅', 'calendar'),
            //         ]).extra());
            //       });
            //       return
            //     }
            bot.sendMessage(chatId, nextMsg[_currentField], nextMmarkup[_currentField]);
        }

    }

}

function sendFinal(chatId, _parseContent) {
    let _reminder = [];
    // _parseContent.remindBefore.map((v,i) => _reminder.push(REMINDER_TEXT[v]))
    // console.log(_reminder);
    // let text = `Great!! You just completed the event details. Please cofirm below \n\n` ;
    // text += `📃 Project Name: ${_parseContent.eventName}\n`
    // text += `🔗 Project Chain: ${_parseContent.eventChain}\n`
    // text += `🔁 Platform:${_parseContent.eventPad}\n`
    // text +=`🗓️ Event Date:  ${_parseContent.eventDate ? _parseContent.eventDate : `NA`}\n`
    // text += `⏰ Reminder: ${_reminder.join(',')}\n`
    // text += `${!_parseContent.eventDate ? `Event Date Reminder: Every ${_parseContent.eventDateRemindInterval/ONE_DAY} days` : ``}`;

    const capitalizeFirstLetter = (str) => {
        return str.charAt(0).toUpperCase() + str.slice(1);
    };

    const capitalizeAllLetters = (str) => {
        return str.toUpperCase();
    }

    if (Array.isArray(_parseContent.remindBefore)) {
        //    console.log('_parseContent.remindBefore:', _parseContent.remindBefore); 

        _parseContent.remindBefore.forEach((v, i) => {
            console.log(`Processing reminder #${i + 1}, value: ${v}`);
            _reminder.push(`⏰ Reminder #${i + 1}: ${REMINDER_TEXT[v]}`);
        });
    } else {
        console.error('_parseContent.remindBefore is not an array');
    }


    let text = `Great!! You just completed the event details. Please confirm below \n\n`;
    text += `📃 Project Name: ${_parseContent.eventName}\n`;
    text += `🔗 Project Chain: ${capitalizeAllLetters(_parseContent.eventChain)}\n`;
    text += `🔁 Platform: ${capitalizeFirstLetter(_parseContent.eventPad)}\n`;
    text += `🗓️ Event Date Time: ${_parseContent.eventDate ? `${_parseContent.eventDate} EST` : 'NA'}\n`;
    //  text += `⏰ Event Time: ${_parseContent.eventTime ? _parseContent.eventTime : 'NA'}\n`;
    text += _reminder.join('\n');
    text += `${!_parseContent.eventDate ? `\n⏰ Event Date Reminder: Every ${_parseContent.eventDateRemindInterval / ONE_DAY} days` : ''}`;


    // console.log(text);

    let linksMarkup = [];
    if (_parseContent.eventLink) {
        linksMarkup.push({
            text: "💻Website",
            url: _parseContent.eventLink,
        });
    }
    if (_parseContent.eventTwitter) {
        linksMarkup.push({
            text: "🐦Twitter",
            url: _parseContent.eventTwitter
        })
    }
    if (_parseContent.communityLink) {
        let communityText = '👥Discord';
        let _communityLink = _parseContent.communityLink.toLowerCase();
        if (_communityLink.includes("t.me") || _communityLink.includes("telegram")) {
            communityText = '👥Telegram ';
        }
        linksMarkup.push({
            text: communityText,
            url: _parseContent.communityLink

        })
    }

    const _markup = {
        reply_markup:
        {
            "inline_keyboard": [
                linksMarkup,
                [
                    {
                        text: "✅ Confirm",
                        callback_data: `confirm`

                    }
                ]
            ]
        }, parse_mode: 'html'

    };

    console.log(text);
    bot.sendMessage(chatId, text, _markup)
}

async function createChatFile(chatId, destination, startAt = null) {

    try {
        const content = fs.readFileSync(sourceFilePath, 'utf-8');
        let _parseContent = JSON.parse(content)
        _parseContent.chatId = chatId;
        _parseContent.currentField = startAt || "eventName";
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


function isLinkValid(link) {
    // Regular expression for a basic URL validation
    var urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w.-]*)*\/?$/;

    // Test if the link matches the pattern
    return urlPattern.test(link);
}



async function read_data(chatId) {
    const destination = path.join(__dirname, `../chats/${chatId}.json`);

    try {

        const content = fs.readFileSync(destination, 'utf-8');
        let _parseContent = JSON.parse(content);
        return _parseContent;
    } catch (error) {
        console.error(`Error reading/parsing file for chatId ${chatId}: ${error.message}`);
        return null;
    }
}
async function store_data_in_database(chatId) {
    try {
        const userEvents = await read_data(chatId);

        if (userEvents !== null) {
            const requestModelInstance = new RequestModel(userEvents);
            await requestModelInstance.save();

            console.log('Data stored in the database:', userEvents);
            return userEvents;
        } else {
            console.error(`Error reading data for chatId ${chatId}: Data is null or invalid.`);
            return false;

        }
    } catch (error) {
        console.error(`Error storing data for chatId ${chatId}: ${error.message}`);
        return false;

    }
}

async function fetchEventsFromDatabase(chatId) {
    try {
  
        const userEvents = await RequestModel.find({ chatId: chatId });
        if (userEvents.length === 0) {
            return [];
        }
        return userEvents;
    } catch (error) {
        console.error(`Error fetching events for chatId ${chatId}: ${error.message}`);
        throw error;
    }
}




function capitalizeAllLetters(str) {
    return str.toUpperCase();
}

function capitalizeFirstLetter(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}



//*********************************************************************************************** *///
function formatMillisecondsToReminder(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
        return ` ${hours} hour${hours > 1 ? 's' : ''} before the launch`;
    } else if (minutes > 0) {
        return `${minutes} minute${minutes > 1 ? 's' : ''} before the launch`;
    } else {
        return ` Less than a minute before the launch`;
    }
}


async function getEventDataByRequestId(chatId, requestId) {
    try {

        const eventDetails = await RequestModel.findOne({ chatId, _id: requestId });
        if (!eventDetails) {
            return null;
        }

        return eventDetails;
    } catch (error) {
        console.error(`Error getting event data for chatId ${chatId} and requestId ${requestId}: ${error.message}`);
        throw error;
    }
}




async function deleteEventByRequestId(chatId, requestId) {
    try {
        console.log("chatId", chatId, "requestId", requestId)
        const deletedEvent = await RequestModel.findOneAndDelete({ chatId: chatId, _id: requestId });

        if (!deletedEvent) {
            console.log(`Event with requestId ${requestId} not found for chatId ${chatId}`);
            return null;
        }

        console.log(`Deleted event with requestId ${requestId} for chatId ${chatId}`);
        return deletedEvent;
    } catch (error) {
        console.error(`Error deleting event with requestId ${requestId} for chatId ${chatId}: ${error.message}`);
        throw error;
    }
}


////////////////////////////////////////////////////////////////////////////////////////////////

const EVENTS_PER_PAGE = 1;

bot.onText(/\/listreminder/, async (msg) => {
    const chatId = msg.chat.id;
    const page = 0;

    try {
       await showEvent(chatId , page ,false)
    } catch (error) { 
        console.error(`Error handling /listreminder for chatId ${chatId}: ${error.message}`);
        bot.sendMessage(chatId, 'Error fetching events. Please try again later.');
    }
});


async function showEvent(chatId , page ,update, callback_data = null){
    const userEvents = await fetchEventsFromDatabase(chatId);


    let eventMsg = '';
    if (userEvents.length > 0) {
  
            const event = userEvents[page];
            console.log(page);

            eventMsg += `Event #${page + 1} of ${userEvents.length}:\n\n`;
            eventMsg += `📃 Project Name: ${event.eventName}\n` +
                        `🔗 Project Chain: ${capitalizeAllLetters(event.eventChain)}\n` +
                        `🔁 Platform: ${capitalizeFirstLetter(event.eventPad)}\n` +
                        `🗓️ Event Date Time: ${event.eventDate ? `${event.eventDate} EST` : 'NA'}` +
                        `\n${event.remindBefore.map((reminder, index) => `⏰ Reminder #${index + 1}: ${REMINDER_TEXT[Number(reminder)]}`).join('\n')}` +
                        `${!event.eventDate ? `\n⏰ Event Date Reminder: Every ${event.eventDateRemindInterval / ONE_DAY} days` : ''}\n\n`;
        // }

        let linksMarkup = [];
        if (event.eventLink) {
            linksMarkup.push({
                text: "💻Website",
                url: event.eventLink,
            });
        }
        if (event.eventTwitter) {
            linksMarkup.push({
                text: "🐦Twitter",
                url: event.eventTwitter
            })
        }
        if (event.communityLink) {
            let communityText = '👥Discord';
            let _communityLink = event.communityLink.toLowerCase();
            if (_communityLink.includes("t.me") || _communityLink.includes("telegram")) {
                communityText = '👥Telegram ';
            }
            linksMarkup.push({
                text: communityText,
                url: event.communityLink
    
            })
        }

        
        let nav = [] ;
        if(userEvents.length > 1){
            if(page > 0){
                nav.push({ text: `Prev`, callback_data: `prev_page_${page}` })
            }
            if(page < userEvents.length - 1){
                nav.push({ text: `Next`, callback_data: `next_page_${page + 1}` })

            }
        }
        console.log(nav);
        const keyboard = {
            inline_keyboard: [
                linksMarkup,
                [
                    { text: 'Edit Event', callback_data: `/edit_${event._id}` },
                    { text: 'Delete Event', callback_data: `/delete_${event._id}` }
                ], 
                nav
            ],
        }; 
        if(!update){
            bot.sendMessage(chatId, eventMsg, {
                parse_mode: 'markdown',
                reply_markup: keyboard,
            });    
        }
        else{
            bot.deleteMessage(chatId, callback_data.message.message_id)
            bot.sendMessage(chatId, eventMsg, {
                parse_mode: 'markdown',
                reply_markup: keyboard,
            });    
        }
    } else {
        bot.sendMessage(chatId, "You haven't created any events yet.");
    }
}



async function fetchEventById(chatId, eventId) {
try {

    const event = await RequestModel.findOne({ chatId: chatId, _id: eventId });
    if(!event){
        throw new Error("No such Event Found");
    }

    return event;
} catch (error) {
    throw new Error(`Error fetching event by ID and chatId: ${error.message}`);
}
}



const createFieldSetButtons = (event,currentPage) => {
    const fields = currentPage == 1 ? fieldMarkupsOne : fieldMarkupsTwo;

    let rowButtons = [];

    if (currentPage == 1) {
        rowButtons = [
            Object.keys(fields)
                .filter(field => ['eventName', 'eventChain'].includes(field))
                .map(field => ({ text: field, callback_data: `/editfield_${field}_${event._id}` })),
            Object.keys(fields)
                .filter(field => ['eventPad', 'eventDate'].includes(field))
                .map(field => ({ text: field, callback_data: `/editfield_${field}_${event._id}` }))
        ];
    } else if (currentPage == 2) {
        rowButtons = [
            Object.keys(fields)
                .filter(field => ['eventLink', 'eventTwitter','communityLink'].includes(field))
                .map(field => ({ text: field, callback_data: `/editfield_${field}_${event._id}` })),
            Object.keys(fields)
                .filter(field => [ 'remindBefore', 'eventDateRemindInterval'].includes(field))
                .map(field => ({ text: field, callback_data: `/editfield_${field}_${event._id}` }))
        ];
    }

    let navigationButtons = [];

    if (currentPage == 1) {
        navigationButtons.push({ text: 'Next', callback_data: '/nextfield_'+event._id });
    } else if (currentPage == 2 ) {
        navigationButtons.push({ text: 'Previous', callback_data: '/prevfield_'+event._id });
    }

    const inlineKeyboard = [...rowButtons, navigationButtons];

    return inlineKeyboard;
};


async function editEvent(chatId, eventId,index) {
    const event = await fetchEventById(chatId, eventId);

    if (!event) {
        bot.sendMessage(chatId, 'Event not found.');
        return;
    }

        const buttons = createFieldSetButtons(event,index);

        bot.sendMessage(chatId, `Editing event: ${event.eventName}`, {
            reply_markup: { inline_keyboard: buttons }
        });
    };


    const extractFieldAndRequestId = (callbackData) => {
        const [, field, requestId] = callbackData.split('_');
        return { field, requestId };
    };


    const askNextField = (chatId, { field, requestId }) => {
        // updateVariable.push({ chatId, field });
        console.log("field",field)

        updateVariable[chatId]= field
        bot.sendMessage(chatId,editNextMsg[field],editNextMarkup[field]);
    
    };



module.exports = botRotues; // Export the router





































// let currentFieldIndex = 0;
// let currentFieldSet = fieldMarkupsOne;
// let currentPage = 0;

// async function editEvent(chatId, eventId) {
//     const event = await fetchEventById(chatId, eventId);

//     if (!event) {
//         bot.sendMessage(chatId, 'Event not found.');
//         return;
//     }

//     const fieldsToUpdate = Object.keys(currentFieldSet);

    

//     const createFieldSetButtons = (event) => {
//         const fields = currentPage == 0 ? fieldMarkupsOne : fieldMarkupsTwo;

//         const fieldButtons = Object.keys(fields)
//             .filter(field => !(field == 'eventDateRemindInterval' && event.eventDate == 'false'))
//             .map(field => (
//                 [{ text: field, callback_data: `/editfield_${field}` }]
//             ));

//         let navigationButtons = [];

//         if (currentPage == 0 && currentFieldIndex < fieldsToUpdate.length - 1) {
//             navigationButtons.push([{ text: 'Next', callback_data: '/nextfield' }]);
//         } else if (currentPage == 1 && currentFieldIndex > 0) {
//             navigationButtons.push([{ text: 'Previous', callback_data: '/prevfield' }]);
//         }

//         return [
//             ...fieldButtons,
//             ...navigationButtons,
//             // [{ text: 'Switch Field Set', callback_data: '/switchfieldset' }],
//             // [{ text: `Page: ${currentPage}`, callback_data: '/pageinfo' }]
//         ];
//     };

//     const askForFieldUpdate = async () => {
//         const currentField = fieldsToUpdate[currentFieldIndex];
//         const markup = currentFieldSet[currentField];
//         const buttons = createFieldSetButtons(event);

//         if (markup) {
//             bot.sendMessage(chatId, `Editing event: ${event.eventName}\nPlease provide updated details`, {
//                 reply_markup: { inline_keyboard: buttons }
//             });

            
//         } else {
//             bot.sendMessage(chatId, `${currentField} is not editable.`, { reply_markup: { inline_keyboard: buttons } });
//         }
//     };

//     const askForNextField = async () => {
//         if (currentFieldIndex < fieldsToUpdate.length) {
//             askForFieldUpdate();
//         } else {
//             try {
//                 await updateEventInDatabase(eventId, event);
//                 bot.sendMessage(chatId, 'Event updated successfully and saved to the database!');
//             } catch (error) {
//                 console.error(`Error updating event for chatId ${chatId} and eventId ${eventId}: ${error.message}`);
//                 bot.sendMessage(chatId, 'Error updating the event. Please try again later.');
//             }
//         }
//     };

//     const updateCommand = '/updateevent';
//     const handleUpdateCommand = async (msg) => {
//         const updatedDetails = msg.text.replace(updateCommand, '').trim();
//         const currentField = fieldsToUpdate[currentFieldIndex];

//         if (currentField) {
//             event[currentField] = updatedDetails;
//             bot.sendMessage(chatId, `Details for ${currentField} updated successfully!`);
//         }

//         currentFieldIndex++;
//         askForNextField();
//     };

//     bot.onText(new RegExp(`^${updateCommand}`), handleUpdateCommand);

//     askForFieldUpdate();
// }

////
// let currentFieldIndex = 0;
// let currentFieldSet = fieldMarkupsOne;
// let currentPage = 0;

// async function editEvent(chatId, eventId) {
//     const event = await fetchEventById(chatId, eventId);

//     if (!event) {
//         bot.sendMessage(chatId, 'Event not found.');
//         return;
//     }

//     const fieldsToUpdate = Object.keys(currentFieldSet);

    

//     const createFieldSetButtons = (event) => {
//         const fields = currentPage == 0 ? fieldMarkupsOne : fieldMarkupsTwo;

//         const fieldButtons = Object.keys(fields)
//             .filter(field => !(field == 'eventDateRemindInterval' && event.eventDate == 'false'))
//             .map(field => (
//                 [{ text: field, callback_data: `/editfield_${field}` }]
//             ));

//         let navigationButtons = [];

//         if (currentPage == 0 && currentFieldIndex < fieldsToUpdate.length - 1) {
//             navigationButtons.push([{ text: 'Next', callback_data: '/nextfield' }]);
//         } else if (currentPage == 1 && currentFieldIndex > 0) {
//             navigationButtons.push([{ text: 'Previous', callback_data: '/prevfield' }]);
//         }

//         return [
//             ...fieldButtons,
//             ...navigationButtons,
//             // [{ text: 'Switch Field Set', callback_data: '/switchfieldset' }],
//             // [{ text: `Page: ${currentPage}`, callback_data: '/pageinfo' }]
//         ];
//     };

//     const askForFieldUpdate = async () => {
//         const currentField = fieldsToUpdate[currentFieldIndex];
//         const markup = currentFieldSet[currentField];
//         const buttons = createFieldSetButtons(event);

//         if (markup) {
//             bot.sendMessage(chatId, `Editing event: ${event.eventName}\nPlease provide updated details`, {
//                 reply_markup: { inline_keyboard: buttons }
//             });

            
//         } else {
//             bot.sendMessage(chatId, `${currentField} is not editable.`, { reply_markup: { inline_keyboard: buttons } });
//         }
//     };

//     const askForNextField = async () => {
//         if (currentFieldIndex < fieldsToUpdate.length) {
//             askForFieldUpdate();
//         } else {
//             try {
//                 await updateEventInDatabase(eventId, event);
//                 bot.sendMessage(chatId, 'Event updated successfully and saved to the database!');
//             } catch (error) {
//                 console.error(`Error updating event for chatId ${chatId} and eventId ${eventId}: ${error.message}`);
//                 bot.sendMessage(chatId, 'Error updating the event. Please try again later.');
//             }
//         }
//     };

//     const updateCommand = '/updateevent';
//     const handleUpdateCommand = async (msg) => {
//         const updatedDetails = msg.text.replace(updateCommand, '').trim();
//         const currentField = fieldsToUpdate[currentFieldIndex];

//         if (currentField) {
//             event[currentField] = updatedDetails;
//             bot.sendMessage(chatId, `Details for ${currentField} updated successfully!`);
//         }

//         currentFieldIndex++;
//         askForNextField();
//     };

//     bot.onText(new RegExp(`^${updateCommand}`), handleUpdateCommand);

//     askForFieldUpdate();
// }
