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
const { SEVEN_DAY, ONE_DAY, ONE_HOUR, fieldMarkupsOne, fieldMarkupsTwo, TWELVE_HOUR, THIRTY_MIN, TEN_MIN, TOKEN_SYMBOL, TOKEN_LIMT, MONTHLY_ETH, TEAM_WALLET, PROVIDER, MONTHLY_WEI, METHOD, TOKEN_CONTRACT, TOKEN_LIMIT_WEI, TEAM_CHATS } = require('../config/constants');
const { log, error } = require('console');
const Calendar = require('telegram-inline-calendar');
const { DateTime } = require("luxon");
const ethUtil = require('ethereumjs-util');
const REGISTER_WALLET_TEXT = `Please send the holder wallet address with minimum ${TOKEN_LIMT} ${TOKEN_SYMBOL}`
const ADD_TO_WHITELIST_TEXT = `Please send the chat id you want to add to whitelist`
const REMOVE_FROM_WHITELIST_TEXT = `Please send the chat id you want to remove from whitelist`

const TXN_TEXT = `Please send the ${MONTHLY_ETH} ETH to our team wallet address \n\n ${TEAM_WALLET}`
const { ethers } = require('ethers');
const TOKEN_ABI = require("../config/TokenABI.json")
// const readFileAsync = util.promisify(fs.readFile);

const calendar = new Calendar(bot, {
    date_format: 'DD-MM-YYYY',
    language: 'en'
});


const updateVariable = [];
var uniqueid = [];
const sourceFilePath = path.join(__dirname, '../config/master.json');

const { Extra, Markup } = require('telegraf');
const { checkAndSendReminders, sendReminderForSetEventDate } = require('../controllers/reminderController');
const SubscriptionModel = require('../models/subscriptionModel');

// const botCal = new Telegraf(token);


const nextField = {
    "eventName": "eventChain",
    "eventChain": "eventPad",
    "eventPad": "eventLink",
    "eventLink": "eventTwitter",
    "eventTwitter": "communityLink",
    "communityLink": "ido", 
    "ido" : "idoDate",
    "idoDate" : "eventDate",
    "eventDate": "remindBefore",
    "remindBefore": "eventNotes",
    "eventNotes" : "eventContract",
    "eventContract" : "eventDateRemindInterval",
    "eventDateRemindInterval": "final",
}

const REMINDER_TEXT = {
    [SEVEN_DAY]: "Seven days before launch",
    [ONE_DAY]: "One day before launch",
    [TWELVE_HOUR]: "Twelve hour before launch",
    [ONE_HOUR]: "One hour before launch",
    [THIRTY_MIN]: "30 minutes before launch",
    [TEN_MIN]: "10 minutes before launch"
}

const DATE_REMINDER_TEXT = {
    [ONE_DAY]: "Every Day",
    [ONE_HOUR]: "Every Hour"
}

const DATE_REMINDER_INTERVAL = 3600000


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

  
 
const idoMsg = `Is there an IDO or private sale for this launch?`;
 
const idoMarkup = {
    "reply_markup": {
        "inline_keyboard": [
            [
                {
                    text: "Yes.",
                    callback_data: "/ido_yes",

                },
                {
                    text: "No.",
                    callback_data: "/ido_no",

                }
            ]
        ]
    }, parse_mode: 'html'
};

const idoDateMsg = `Awesome! When is this IDO/Private Sale happening? Please enter a date and time (MM/DD/YYYY HH:MM). Please note default timezone is EST.`;
 
const idoDateMarkup = {
    "reply_markup": {
        "inline_keyboard": [
            [
                {
                    text: "This IDO/Private Sale doesn't have any date yet.",
                    callback_data: "/noidodate",

                }
            ]
        ]
    }, parse_mode: 'html'
};




const eventContractMsg = `Enter a contract address for this project if you have one.`;
 
const eventContractMarkup = {
    "reply_markup": {
        "inline_keyboard": [
            [
                {
                    text: "No Contract.",
                    callback_data: "/nocontract",

                }
            ]
        ]
    }, parse_mode: 'html'
};

const eventNotesMsg = `Do you have any notes for this launch that you don't want to forget?`;
 
const eventNotesMarkup = {
    "reply_markup": {
        "inline_keyboard": [
            [
                {
                    text: "No Notes.",
                    callback_data: "/nonotes",

                }
            ]
        ]
    }, parse_mode: 'html'
};
//

const eventDateMsg = `Great! When is this event happening? Please enter a date and time (MM/DD/YYYY HH:MM). Please note default timezone is EST.`;
// const eventDateMsg = `Great! When is this event happening? Please enter a date and time (DD/MM/YYYY HH:MM):`;

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
                    text: REMINDER_TEXT[TWELVE_HOUR],
                    callback_data: `remindBefore_${TWELVE_HOUR}`,
                }
            ],
            [
                {
                    text: REMINDER_TEXT[ONE_HOUR],
                    callback_data: `remindBefore_${ONE_HOUR}`,
                }
            ],
            [
                {
                    text: REMINDER_TEXT[THIRTY_MIN],
                    callback_data: `remindBefore_${THIRTY_MIN}`,
                }
            ],
            [
                {
                    text: REMINDER_TEXT[TEN_MIN],
                    callback_data: `remindBefore_${TEN_MIN}`,
                }
            ],
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
    "communityLink": idoMsg,
    "ido" : idoDateMsg,
    "idoDate" : eventDateMsg,
    "eventDate": remindBeforeMsg,
    // "eventTime": remindBeforeMsg,
    "remindBefore": eventNotesMsg,
    "eventNotes" : eventContractMsg,    
    "eventContract" : eventDateRemindIntervalMsg,    
    "eventDateRemindInterval": null
}

const nextMmarkup = {
    "eventName": eventChainMarkup,
    "eventChain": eventPadMarkup,
    "eventPad": eventLinkMarkup,
    "eventLink": eventTwitterMarkup,
    "eventTwitter": communityLinkMarkup,
    "communityLink": idoMarkup,
    "ido" : idoDateMarkup,
    "idoDate" : eventDateMarkup,
    "eventDate": remindBeforeMsgMarkup,
    // "eventTime": remindBeforeMsgMarkup    
    "remindBefore": eventNotesMarkup,
    "eventNotes" : eventContractMarkup,
    "eventContract" : eventDateRemindIntervalMarkup,
    "eventDateRemindInterval": null
}



const editNextMsg = {
    "eventName": eventNameMsg,
    "eventChain": eventChainMsg,
    "eventPad": eventPadMsg,
    "eventLink": eventLinkMsg,
    "eventTwitter": eventTwitterMsg,
    "communityLink": communityLinkMsg,
    "idoDate": idoDateMsg,
    "eventDate": eventDateMsg,
    "remindBefore": remindBeforeMsg,
    "eventNotes" : eventNotesMsg,
    "eventContract" : eventContractMsg,
    "eventDateRemindInterval": eventDateRemindIntervalMsg
}

const editNextMarkup = {
    "eventName": eventNameMarkup,
    "eventChain": eventChainMarkup,
    "eventPad": eventPadMarkup,
    "eventLink": eventLinkMarkup,
    "eventTwitter": eventTwitterMarkup,
    "communityLink": communityLinkMarkup,
    "idoDate": idoDateMarkup,
    "eventDate": eventDateMarkup,
    "remindBefore": remindBeforeMsgMarkup,
    "eventNotes" : eventNotesMarkup,
    "eventContract" : eventContractMarkup,
    "eventDateRemindInterval": eventDateRemindIntervalMarkup
}


botRotues.get('/', async (req, res) => {
    // console.log("request received");
    bot.onText(/\/start/, async (msg) => {
        const chatId = msg.chat.id;

        if (!uniqueid.includes(chatId + msg.message_id)) {
        console.log("jhdvchjvcjvhj");
            sendWelcomeText(chatId);
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
        let _time = parseInt(new Date().getTime()/1e3)
        // console.log(_time);
        // console.log(chatId + callbackQuery.message.message_id + _time);
        // console.log(uniqueid.includes(chatId + callbackQuery.message.message_id + _time));
        if (!uniqueid.includes(chatId + callbackQuery.message.message_id + _time)) {
            uniqueid.push(chatId + callbackQuery.message.message_id +  _time)

            if (callbackQuery.data == "/setreminder") {
                setreminder(chatId)
            }

            if(callbackQuery.data == "/subscription") {
                bot.deleteMessage(chatId,callbackQuery.message.message_id)
                sendSubscriptionMenu(chatId)
            }
            if(callbackQuery.data == "/addwhitelist") {
                bot.deleteMessage(chatId,callbackQuery.message.message_id)
                addwhitelist(chatId)
            }
            
            if(callbackQuery.data == "/removewhitelist") {
                bot.deleteMessage(chatId,callbackQuery.message.message_id)
                removeFromWhitelist(chatId)
            }

            if(callbackQuery.data == "/adminwhitelist") {
                bot.deleteMessage(chatId,callbackQuery.message.message_id)
                sendWhitelistMenu(chatId)
            }
            
            if(callbackQuery.data == "/gotohome") {
                bot.deleteMessage(chatId,callbackQuery.message.message_id)
                sendWelcomeText(chatId)
            }

            if(callbackQuery.data == "/tokenHolder") {
                bot.deleteMessage(chatId,callbackQuery.message.message_id)
                sendHolderSubscription(chatId)
            }

            if(callbackQuery.data == "/getwhitelisted") {
                bot.deleteMessage(chatId,callbackQuery.message.message_id)
                getWhitelistMessage(chatId)
            }
            
            
            if(callbackQuery.data == "/updatetxnhash") {
                bot.deleteMessage(chatId,callbackQuery.message.message_id)
                txnUpdateSubscriptionMessage(chatId)
            }

            if(callbackQuery.data == "/updatetokenHolder") {
                bot.deleteMessage(chatId,callbackQuery.message.message_id)
                registerUpdateSubscriptionMessage(chatId)
            }

            if(callbackQuery.data == "/paymonthy") {
                bot.deleteMessage(chatId,callbackQuery.message.message_id)
                sendMonthlySubscription(chatId)
            }

            
            if(callbackQuery.data == "/listreminder"){ 
                const page = 0;            
                try {
                    console.log("here");
                   await showEvent(chatId , page ,false)
                } catch (error) { 
                    console.error(`Error handling /listreminder for chatId ${chatId}: ${error.message}`);
                    bot.sendMessage(chatId, 'Error fetching events. Please try again later.');
                }
            }

            if (callbackQuery.data == "/nolink") {
                if(updateVariable[chatId]){
                updateField(chatId ,  updateVariable[chatId].field ,updateVariable[chatId].requestId , false)
                return;
                }
                // bot.editMessageReplyMarkup(JSON.stringify({ // Added JSON.stringify()
                //     inline_keyboard: [[]]
                // })
                //     , {
                //         chat_id: chatId,
                //         message_id: callbackQuery.message.message_id
                //     })
                bot.deleteMessage(chatId,callbackQuery.message.message_id)
                // sendNextMsg(chatId)
                moveForward(chatId, callbackQuery.message);

            }

            if (callbackQuery.data == "/ido_no") {
                if(updateVariable[chatId]){
                updateField(chatId ,  updateVariable[chatId].field ,updateVariable[chatId].requestId , false)
                return;
                }
                // bot.editMessageReplyMarkup(JSON.stringify({ // Added JSON.stringify()
                //     inline_keyboard: [[]]
                // })
                //     , {
                //         chat_id: chatId,
                //         message_id: callbackQuery.message.message_id
                //     })
                bot.deleteMessage(chatId,callbackQuery.message.message_id)


                    skipField(chatId)
                    bot.sendMessage(chatId, eventDateMsg, eventDateMarkup);
                // sendNextMsg(chatId)
                // moveForward(chatId, callbackQuery.message);
                // updateData(chatId, "No")
            }

            if (callbackQuery.data == "/ido_yes") {
                if(updateVariable[chatId]){
                updateField(chatId ,  updateVariable[chatId].field ,updateVariable[chatId].requestId , false)
                return;
                }
                // bot.editMessageReplyMarkup(JSON.stringify({ // Added JSON.stringify()
                //     inline_keyboard: [[]]
                // })
                //     , {
                //         chat_id: chatId,
                //         message_id: callbackQuery.message.message_id
                //     })
                bot.deleteMessage(chatId,callbackQuery.message.message_id)

                // sendNextMsg(chatId)
                // moveForward(chatId, callbackQuery.message);
                updateData(chatId, "Yes")
            }

            if (callbackQuery.data == "/continue_reminder") {
                if(updateVariable[chatId]){
                    updateField(chatId ,  updateVariable[chatId].field ,updateVariable[chatId].requestId , false , true)
                    return;
                    }
                bot.deleteMessage(chatId,callbackQuery.message.message_id)

                moveForward(chatId);

            }

            if (callbackQuery.data == "/nodate") {
                moveForward(chatId);
                // bot.editMessageReplyMarkup(JSON.stringify({ // Added JSON.stringify()
                //     inline_keyboard: [[]]
                // })
                //     , {
                //         chat_id: chatId,
                //         message_id: callbackQuery.message.message_id
                //     })
                bot.deleteMessage(chatId,callbackQuery.message.message_id)


            }
            
            if (callbackQuery.data == "/nocontract") {
                moveForward(chatId);
                // bot.editMessageReplyMarkup(JSON.stringify({ // Added JSON.stringify()
                //     inline_keyboard: [[]]
                // })
                //     , {
                //         chat_id: chatId,
                //         message_id: callbackQuery.message.message_id
                //     })
                bot.deleteMessage(chatId,callbackQuery.message.message_id)


            }
            if (callbackQuery.data == "/nonotes") {
                moveForward(chatId);
                // bot.editMessageReplyMarkup(JSON.stringify({ // Added JSON.stringify()
                //     inline_keyboard: [[]]
                // })
                //     , {
                //         chat_id: chatId,
                //         message_id: callbackQuery.message.message_id
                //     })
                bot.deleteMessage(chatId,callbackQuery.message.message_id)


            }
            if (callbackQuery.data == "/noidodate") {
                moveForward(chatId);
                // bot.editMessageReplyMarkup(JSON.stringify({ // Added JSON.stringify()
                //     inline_keyboard: [[]]
                // })
                //     , {
                //         chat_id: chatId,
                //         message_id: callbackQuery.message.message_id
                //     })
                bot.deleteMessage(chatId,callbackQuery.message.message_id)


            }

            

            if (callbackQuery.data.startsWith("remindBefore_")) {
                console.log(callbackQuery.data);
                console.log(callbackQuery.data.replace("remindBefore_", ""));
                if(updateVariable[chatId]){
                    updateField(chatId ,  updateVariable[chatId].field ,updateVariable[chatId].requestId , callbackQuery.data.replace("remindBefore_", ""))
                    return
                    }
                setRemindBefore(chatId, callbackQuery.data.replace("remindBefore_", ""))
            }

            if (callbackQuery.data.startsWith("reminderDate")) {
                if(updateVariable[chatId]){
                    updateField(chatId ,  updateVariable[chatId].field ,updateVariable[chatId].requestId , callbackQuery.data.replace("reminderDate_", ""))
                    return
                    }
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

                    await deleteEventByRequestId(chatId, requestId);
                    bot.sendMessage(chatId, 'Event deleted successfully ✅');

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
                    bot.deleteMessage(chatId, callbackQuery.message.message_id)


                } catch (error) {
                    console.error(`Error handling /edit_${eventId} for chatId ${chatId}: ${error.message}`);
                    bot.sendMessage(chatId, 'Error editing the event. Please try again later.');
                }
                
                // bot.sendMessage(chatId, `You clicked the Edit button for event ${eventIndex + 1}`);
                //
              
            } 
       
        
            if (callbackQuery.data.startsWith('/nextfield_')) {
                const eventId = callbackQuery.data.split('_')[1];
                console.log("eventId ",eventId)
                try {
                    await editEvent(chatId, eventId,2);
                    bot.deleteMessage(chatId, callbackQuery.message.message_id)

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
                    bot.deleteMessage(chatId, callbackQuery.message.message_id)
                } catch (error) {
                    console.error(`Error handling /edit_${eventId} for chatId ${chatId}: ${error.message}`);
                    bot.sendMessage(chatId, 'Error editing the event. Please try again later.');
                }
                
            } 

            if (callbackQuery.data.startsWith('/canceledit_')) {
                const eventId = callbackQuery.data.split('_')[1];
                console.log(eventId);

                try {
                const userEvents = await fetchEventsFromDatabase(chatId, null);
                let page = 0 
                userEvents.map(async (v,i) => {
                    if(v._id == eventId){
                        page = i                      
                        await showEvent(chatId , page ,false)                    
                        return;
                    }

                })
            } catch (error) { 
                console.error(`Error handling /listreminder for chatId ${chatId}: ${error.message}`);
                bot.sendMessage(chatId, 'Error fetching events. Please try again later.');
            }
            
               
               
                
            } 

            
        
            if (callbackQuery.data.startsWith('/editfield_')) {
                console.log("here")
                const { field, requestId } = extractFieldAndRequestId(callbackQuery.data);
              

                try {
      
                      askNextField(chatId, { field, requestId , message_id : callbackQuery.message.message_id});

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
            if (callbackQuery.data.startsWith('next_page_')) {
                const nextPage = parseInt(callbackQuery.data.split('_')[2]) || 1;
                console.log(nextPage);

                // bot.sendMessage(chatId, `/listreminder ${nextPage}`);
                await showEvent(chatId,nextPage,true,callbackQuery)
            }

            if (callbackQuery.data.startsWith('prev_page_')) {
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
            console.log(msg.text);
            uniqueid.push(chatId + msg.message_id)

            if(msg.reply_to_message){ 
                if(msg.reply_to_message.text == REGISTER_WALLET_TEXT){
                updateSubscriptionWallet(chatId,text)
                return;
                 }
                else if(msg.reply_to_message?.text == TXN_TEXT){
                updateSubscriptionTxn(chatId,text)
                return;
                 }
                 else if(msg.reply_to_message?.text == ADD_TO_WHITELIST_TEXT){
                    addtowhitelist(chatId,text)
                    return;
                     }
                     else if(msg.reply_to_message?.text == REMOVE_FROM_WHITELIST_TEXT){
                        removefromwhitelist(chatId,text)
                        return;
                         }
            }
            else if (text !== "/setreminder" && text !== "/start" && text !== "/nolink" && text !== "/nodate" && text !== "/listreminder"  && text !== "/listreminder"  && text !== "/list_launches_next_7days" && text !== "/list_launches_next_month" && text != "/ido_yes" && text != "/ido_no") {
          
            
                console.log(text);
                let _now = new Date().getTime()
                const checkValidity = await SubscriptionModel.findOne({chatId: chatId, subscriptionEnd : {$gte: _now}});
                if(!checkValidity){
                    sendSubscriptionMenu(chatId);
                    return;
                }
                if(updateVariable[chatId]){
                    updateField(chatId ,  updateVariable[chatId].field ,updateVariable[chatId].requestId , text)
                }
                else{
                    updateData(chatId, text)
                }

            }
        }

    })

    res.send({ status: "OK" })

})


botRotues.checkAndSendReminders = () => {
    console.log("running");
    checkAndSendReminders(bot)
}

botRotues.sendReminderForSetEventDate = () => {
    console.log("running");
    sendReminderForSetEventDate(bot)
}
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

function skipField(chatId, msg = null) {
    const destination = path.join(__dirname, `../chats/${chatId}.json`);
    const content = fs.readFileSync(destination, 'utf-8');
    let _parseContent = JSON.parse(content)
    let _currentField = _parseContent.currentField;    
    _parseContent.currentField = nextField[nextField[_currentField]]; 
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.writeFileSync(destination, JSON.stringify(_parseContent));



}

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
    if(_parseContent.remindBefore.length >= 3){
        _parseContent.currentField =  nextField[_parseContent.currentField];
        }       
    // console.log(_parseContent); 
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.writeFileSync(destination, JSON.stringify(_parseContent));
    console.log(_parseContent.remindBefore.includes(ONE_DAY));

    if (_parseContent.remindBefore.length < 3 ) {

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
        if (!_parseContent.remindBefore.includes(TWELVE_HOUR)) {
            _keybArray.push([{
                text: REMINDER_TEXT[TWELVE_HOUR],
                callback_data: `remindBefore_${TWELVE_HOUR}`,
            }])
        }
        if (!_parseContent.remindBefore.includes(ONE_HOUR)) {
            _keybArray.push([{
                text: REMINDER_TEXT[ONE_HOUR],
                callback_data: `remindBefore_${ONE_HOUR}`,
            }])
        }
        if (!_parseContent.remindBefore.includes(THIRTY_MIN)) {
            _keybArray.push([{
                text: REMINDER_TEXT[THIRTY_MIN],
                callback_data: `remindBefore_${THIRTY_MIN}`,
            }])
        }
        if (!_parseContent.remindBefore.includes(TEN_MIN)) {
            _keybArray.push([{
                text: REMINDER_TEXT[TEN_MIN],
                callback_data: `remindBefore_${TEN_MIN}`,
            }])
        }
        _keybArray.push([{
            text: "Save Reminders.",
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



async function setreminder(chatId) {
     
    let _now = new Date().getTime()
    const checkValidity = await SubscriptionModel.findOne({chatId: chatId, subscriptionEnd : {$gte: _now}});
    if(!checkValidity){
        sendSubscriptionMenu(chatId);
        return;
    }
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
        // bot.sendMessage(chatId, 'Welcome to the Event Reminder Wizard! ✨ To conjure up a reminder, use the magic words: /setreminder. Let the enchantment begin!', {
        //     "reply_markup": {
        //         "inline_keyboard": [
        //             [
        //                 {
        //                     text: "Set Reminder",
        //                     callback_data: "/setreminder",

        //                 },
        //                 {
        //                     text: "Delete Reminder",
        //                     callback_data: "/deletereminder",

        //                 },
        //             ]
        //         ]
        //     }, parse_mode: 'html'
        // });

        sendWelcomeText(chatId)

    }
    else {
        if (_currentField == "eventDateRemindInterval") {
            _parseContent[_currentField] = data * DATE_REMINDER_INTERVAL;
        }
        else {
            if (_currentField == "eventLink" || _currentField == "eventTwitter" || _currentField == "communityLink") {
             
                let _data = data.toLowerCase();
                _data = _data.split("?")[0];
                _data = _data.startsWith("https://") || _data.startsWith("http://") ? _data : "https://"+_data
                // data = _data.toLowerCase();
                data = data.toLowerCase().replace(_data.split("?")[0],_data)     
                
                console.log(data);
                if (!isLinkValid(_data)) {
                    bot.sendMessage(chatId, "The link you shared is not valid, please share a valid link.(e.g. “https://google.com”)");
                    return;
                }
            }
            if (_currentField == "eventContract") {
                let _valid = isValidEthereumAddress(data);
                    console.log(_valid);
                if (!_valid) {
                    bot.sendMessage(chatId, "The address you entered is not valid. Please re-enter correct address");
                    // bot.sendMessage(chatId, "The date you entered is not in requested format or is in the past.(e.g. DD/MM/YYYY)");
                    return;
                }
                // data = _date.getTime()   
            }
            if (_currentField == "eventDate") {
                let _date = new Date(data);
                let _cdate = new Date();
                console.log(_date);
                if (_date == "Invalid Date" || _date < _cdate) {
                    bot.sendMessage(chatId, "The date you entered is not in requested format or is in the past.(e.g. MM/DD/YYYY)");
                    // bot.sendMessage(chatId, "The date you entered is not in requested format or is in the past.(e.g. DD/MM/YYYY)");
                    return;
                }
                data = _date.getTime()   
            }

            if (_currentField == "idoDate") {
                let _date = new Date(data);
                let _cdate = new Date();
                console.log(_date);
                if (_date == "Invalid Date" || _date < _cdate) {
                    bot.sendMessage(chatId, "The date you entered is not in requested format or is in the past.(e.g. MM/DD/YYYY)");
                    // bot.sendMessage(chatId, "The date you entered is not in requested format or is in the past.(e.g. DD/MM/YYYY)");
                    return;
                }
                data = _date.getTime()   
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
    if(_parseContent?.ido){
        text += `🚀 Private Sale: ${((_parseContent.ido).toUpperCase())}\n`;
        text += `📆 IDO Date Time: ${_parseContent.idoDate ? `${DateTime.fromMillis(parseInt(_parseContent.idoDate), { zone: process.env.TZ }).toFormat('LLL dd, hh:mm a')} EST` : 'NA'}\n`;        
    }
    else{
        text += `🚀 Private Sale: No\n`;
    }
    text += `🗓️ Event Date Time: ${_parseContent.eventDate ? `${DateTime.fromMillis(parseInt(_parseContent.eventDate), { zone: process.env.TZ }).toFormat('LLL dd, hh:mm a')} EST` : 'NA'}\n`;
    //  text += `⏰ Event Time: ${_parseContent.eventTime ? _parseContent.eventTime : 'NA'}\n`;
    text += _reminder.join('\n');
    text += `${!_parseContent.eventDate ? `\n⏰ Event Date Reminder: Every ${_parseContent.eventDateRemindInterval / ONE_DAY} days` : ''}`;
    // console.log(_parseContent.eventNotes);
    text += `\n✏️ Notes: ${(_parseContent.eventNotes == false ? "NA" : capitalizeFirstLetter(_parseContent.eventNotes))}\n`;
    text += `📑 Contract: ${(_parseContent.eventContract == false ? "NA" : "`"+_parseContent.eventContract+"` (Tap to copy)")}\n\n`;

    console.log(text);

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
        }, parse_mode: 'markdown'

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



// 
// async function fetchEventsFromDatabase(chatId) {
//     try {
  
//         const userEvents = await RequestModel.find({ chatId: chatId });
//         if (userEvents.length === 0) {
//             return [];
//         }
//         return userEvents;
//     } catch (error) {
//         console.error(`Error fetching events for chatId ${chatId}: ${error.message}`);
//         throw error;
//     }
// }

async function fetchEventsFromDatabase(chatId, dateFilter=null) {
    try {
        let _filter = { chatId: chatId };

        if(dateFilter){
            _filter = {chatId: chatId , eventDate : { $lte : dateFilter }}
        }
        console.log(_filter);
        const userEvents = await RequestModel.find(_filter).sort({eventDate: 1});
        console.log(userEvents.length);
        if (userEvents.length === 0) {
            return [];
        }
        return userEvents;

        // Sort events by parsed eventDate in ascending order
        // const sortedEvents = userEvents.sort((eventA, eventB) => {
        //     const dateA = parseEventDate(eventA.eventDate);
        //     const dateB = parseEventDate(eventB.eventDate);
        //     return dateA - dateB;
        // });

        // return sortedEvents;
    } catch (error) {
        console.error(`Error fetching events for chatId ${chatId}: ${error.message}`);
        throw error;
    }
}

function parseEventDate(dateString) {
    if (!dateString || typeof dateString !== 'string') {
      
        return null
    }

    const dateParts = dateString.split(' ');

    if (dateParts.length !== 2) {
        return null
    }

    const [day, month, year] = dateParts[0].split('/');
    const [hours, minutes] = dateParts[1].split(':');

    return new Date(year, month - 1, day, hours, minutes);
}


// list_launches_next_month
// async function listLaunchesNextMonth(chatId) {
//     try {
//         const userEvents = await RequestModel.find({ chatId: chatId });
//         if (userEvents.length === 0) {
//             return [];
//         }

//         const currentDate = new Date();
//         const startOfNextMonth = new Date(currentDate);
//         startOfNextMonth.setMonth(currentDate.getMonth() + 1, 1); 

//         const endOfNextMonth = new Date(startOfNextMonth);
//         endOfNextMonth.setMonth(startOfNextMonth.getMonth() + 1); 

//         const launchesNextMonth = userEvents.filter(event => {
//             const eventDate = parseEventDate(event.eventDate);
//             return eventDate >= startOfNextMonth && eventDate < endOfNextMonth;
//         });

//         const sortedLaunches = launchesNextMonth.sort((eventA, eventB) => {
//             const dateA = parseEventDate(eventA.eventDate);
//             const dateB = parseEventDate(eventB.eventDate);
//             return dateA - dateB;
//         });

//         return sortedLaunches;
//     } catch (error) {
//         console.error(`Error fetching launches for chatId ${chatId}: ${error.message}`);
//         throw error;
//     }
// }


















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


bot.onText(/\/list_launches_next_7days/, async (msg) => {
    const chatId = msg.chat.id;
    const page = 0;

    try {
       let _sevenDays =  new Date().getTime() + (86400000 * 7)
    //    _sevenDays = new Date(_sevenDays);
        // console.log(_sevenDays);
       await showEvent(chatId , page ,false , null , _sevenDays)
    } catch (error) { 
        console.error(`Error handling /listreminder for chatId ${chatId}: ${error.message}`);
        bot.sendMessage(chatId, 'Error fetching events. Please try again later.');
    }
});

bot.onText(/\/list_launches_next_month/, async (msg) => {
    const chatId = msg.chat.id;
    const page = 0;

    try {
       let _thirdtyDays =  new Date().getTime() + (86400000 * 30)
    //    _thirdtyDays = new Date(_thirdtyDays);
       await showEvent(chatId , page ,false,null , _thirdtyDays)
    } catch (error) { 
        console.error(`Error handling /listreminder for chatId ${chatId}: ${error.message}`);
        bot.sendMessage(chatId, 'Error fetching events. Please try again later.');
    }
});

async function getEvents(chatId ,requestId){
    const event = await RequestModel.findOne({ _id: requestId });
    console.log(event);
    let eventMsg = `Event details:\n\n`;
    eventMsg += `📃 Project Name: ${event.eventName}\n` +
                `🔗 Project Chain: ${capitalizeAllLetters(event.eventChain)}\n` +
                `🔁 Platform: ${capitalizeFirstLetter(event.eventPad)}\n` ;
    if((event?.ido)?.toLowerCase() == "yes"){
    eventMsg += `🚀 Private Sale: ${((event.ido).toUpperCase())}\n`;
          eventMsg += `📆 IDO Date Time: ${event.idoDate && event.idoDate != 'false'? `${DateTime.fromMillis(parseInt(event.idoDate), { zone: process.env.TZ }).toFormat('LLL dd, hh:mm a')} EST` : 'NA'}\n`;        
    }
    else{
        eventMsg += `🚀 Private Sale: No\n`;
    }
    eventMsg +=         `🗓️ Event Date Time: ${event.eventDate && event.eventDate != 'false' ? `${DateTime.fromMillis(parseInt(_parseContent.eventDate), { zone: process.env.TZ }).toFormat('LLL dd, hh:mm a')} EST` : 'NA'}` +
                `\n${event.remindBefore.map((reminder, index) => `⏰ Reminder #${index + 1}: ${REMINDER_TEXT[Number(reminder)]}`).join('\n')}` +
                `${!event.eventDate  || event.eventDate == 'false' ? `\n⏰ Event Date Reminder: Every ${event.eventDateRemindInterval / ONE_DAY} days` : ''}\n`;
                eventMsg += `✏️ Notes: ${(event.eventNotes == 'false' ? "NA" : capitalizeFirstLetter(event.eventNotes))}\n`;
                eventMsg += `📑 Contract: ${(event.eventContract == 'false' ? "NA" : "`"+event.eventContract+"` (Tap to copy)")}\n\n`;
            
// }

let linksMarkup = [];
if (event.eventLink &&  event.eventLink != 'false') {
    linksMarkup.push({
        text: "💻Website", 
        url: event.eventLink,
    });
}
if (event.eventTwitter &&  event.eventTwitter != 'false') {
    linksMarkup.push({
        text: "🐦Twitter",
        url: event.eventTwitter
    })
}
if (event.communityLink &&  event.communityLink != 'false' ) {
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

  
const keyboard = {
    inline_keyboard: [
        linksMarkup        
    ],
}; 
 
    bot.sendMessage(chatId, eventMsg, {
        parse_mode: 'markdown',
        reply_markup: keyboard,
    })
 
}

async function showEvent(chatId , page ,update, callback_data = null, dateFilter =null){
    console.log(dateFilter);

    let _now = new Date().getTime()
    const checkValidity = await SubscriptionModel.findOne({chatId: chatId, subscriptionEnd : {$gte: _now}});
    if(!checkValidity){
        sendSubscriptionMenu(chatId);
        return;
    }

    const userEvents = await fetchEventsFromDatabase(chatId, dateFilter);


    let eventMsg = '';
    if (userEvents.length > 0) {
  
            const event = userEvents[page];
            console.log(event);

    

        console.log(new Date(parseInt(event.idoDate)));

            eventMsg += `Launch #${page + 1} of ${userEvents.length}:\n\n`;
            eventMsg += `📃 Project Name: ${event.eventName}\n` +
                        `🔗 Project Chain: ${capitalizeAllLetters(event.eventChain)}\n` +
                        `🔁 Platform: ${capitalizeFirstLetter(event.eventPad)}\n` ;
                        if((event?.ido)?.toLowerCase() == "yes"){
                        eventMsg += `🚀 Private Sale: ${((event.ido).toUpperCase())}\n`;
                            eventMsg += `📆 IDO Date Time: ${event.idoDate && event.idoDate !== 'false' ? `${DateTime.fromMillis(parseInt(event.idoDate), { zone: process.env.TZ }).toFormat('LLL dd, hh:mm a')} EST` : 'NA'}\n`;        
                        }
                        else{
                            eventMsg += `🚀 Private Sale: No\n`;
                        }
                        // `🗓️ Event Date Time: ${event.eventDate && event.eventDate != 'false' ? `${(new Date(parseInt(event.eventDate)).toLocaleString())} EST` : 'NA'}` +
                        eventMsg +=    `🗓️ Event Date Time: ${event.eventDate && event.eventDate !== 'false'
                       ? ` ${DateTime.fromMillis(parseInt(event.eventDate), { zone: process.env.TZ }).toFormat('LLL dd, hh:mm a')} EST`
                        : 'NA'}` +
                        `\n${event.remindBefore.map((reminder, index) => `⏰ Reminder #${index + 1}: ${REMINDER_TEXT[Number(reminder)]}`).join('\n')}` +
                        `${!event.eventDate  || event.eventDate == 'false' ? `\n⏰ Event Date Reminder: Every ${event.eventDateRemindInterval / ONE_DAY} days` : ''}\n`;
         eventMsg += `✏️ Notes: ${(event?.eventNotes == 'false' ? "NA" : capitalizeFirstLetter(event.eventNotes))}\n`;
        eventMsg += `📑 Contract: ${(event.eventContract == 'false' ? "NA" : "`"+event.eventContract+"` (Tap to copy)")}\n\n`;

        let linksMarkup = [];
        if (event.eventLink &&  event.eventLink != 'false') {
            linksMarkup.push({
                text: "💻Website",
                url: event.eventLink,
            });
        }
        if (event.eventTwitter &&  event.eventTwitter != 'false') {
            linksMarkup.push({
                text: "🐦Twitter",
                url: event.eventTwitter
            })
        }
        if (event.communityLink &&  event.communityLink != 'false' ) {
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
                nav.push({ text: `Prev ⬅️`, callback_data: `prev_page_${page}` })
            }
            if(page < userEvents.length - 1){
                nav.push({ text: `Next ➡️`, callback_data: `next_page_${page + 1}` })

            }
        }
        console.log(nav);
        const keyboard = {
            inline_keyboard: [
                linksMarkup,
                [
                    { text: '✏️Edit Event', callback_data: `/edit_${event._id}` },
                    { text: '❌Delete Event', callback_data: `/delete_${event._id}` }
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
        if(dateFilter){
            bot.sendMessage(chatId, "You haven't created yet any events for the selected range.");
        }
        else{
        bot.sendMessage(chatId, "You haven't created any events yet.");

        }
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
                .map(field => ({ text: fields[field], callback_data: `/editfield_${field}_${event._id}` })),
            Object.keys(fields)
                .filter(field => ['eventPad', 'eventDate'].includes(field))
                .map(field => ({ text: fields[field], callback_data: `/editfield_${field}_${event._id}` })),
            Object.keys(fields)
                .filter(field => ['idoDate', 'eventNotes'].includes(field))
                .map(field => ({ text: fields[field], callback_data: `/editfield_${field}_${event._id}` })),
            Object.keys(fields)
                .filter(field => ['eventContract'].includes(field))
                .map(field => ({ text: fields[field], callback_data: `/editfield_${field}_${event._id}` })),
        ];
    } else if (currentPage == 2) {
        rowButtons = [
            Object.keys(fields)
                .filter(field => ['eventLink', 'eventTwitter'].includes(field))
                .map(field => ({ text: fields[field], callback_data: `/editfield_${field}_${event._id}` })),
            Object.keys(fields)
                .filter(field => ['communityLink','remindBefore'].includes(field))
                .map(field => ({ text: fields[field], callback_data: `/editfield_${field}_${event._id}` })),        
        ];

        if(!event.eventDate  || event.eventDate == 'false'){
            rowButtons.push([{ text: fields['eventDateRemindInterval'], callback_data: `/editfield_eventDateRemindInterval_${event._id}` }])
        }  
    }

    let navigationButtons = [];

    if (currentPage == 1) {
        navigationButtons.push({ text: '➡️ Next', callback_data: '/nextfield_'+event._id });
    } else if (currentPage == 2 ) {
        navigationButtons.push({ text: '⬅️ Previous', callback_data: '/prevfield_'+event._id });
    }
    navigationButtons.push({ text: 'Cancel ❌', callback_data: '/canceledit_'+event._id });

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

        bot.sendMessage(chatId, `Editing event: ${event.eventName}.\n\nPlease select which field you want to edit`, {
            reply_markup: { inline_keyboard: buttons }
        });
    };


    const extractFieldAndRequestId = (callbackData) => {
        const [, field, requestId] = callbackData.split('_');
        return { field, requestId };
    };


    const askNextField =async (chatId, { field, requestId , message_id }) => {
        // updateVariable.push({ chatId, field });
        console.log("field",field)
        const getEvent = await RequestModel.findOne({ _id : requestId});

        updateVariable[chatId] = {field: field , requestId:requestId };

        let _keybArray = [];
        if (!getEvent.remindBefore.includes(SEVEN_DAY)) {
            _keybArray.push([{
                text: REMINDER_TEXT[SEVEN_DAY],
                callback_data: `remindBefore_${SEVEN_DAY}`,
            }])
        }

        if (!getEvent.remindBefore.includes(ONE_DAY)) {
            _keybArray.push([{
                text: REMINDER_TEXT[ONE_DAY],
                callback_data: `remindBefore_${ONE_DAY}`,
            }])
        }

        if (!getEvent.remindBefore.includes(TWELVE_HOUR)) {
            _keybArray.push([{
                text: REMINDER_TEXT[TWELVE_HOUR],
                callback_data: `remindBefore_${TWELVE_HOUR}`,
            }])
        }
        if (!getEvent.remindBefore.includes(ONE_HOUR)) {
            _keybArray.push([{
                text: REMINDER_TEXT[ONE_HOUR],
                callback_data: `remindBefore_${ONE_HOUR}`,
            }])
        }
        if (!getEvent.remindBefore.includes(THIRTY_MIN)) {
            _keybArray.push([{
                text: REMINDER_TEXT[THIRTY_MIN],
                callback_data: `remindBefore_${THIRTY_MIN}`,
            }])
        }
        if (!getEvent.remindBefore.includes(TEN_MIN)) {
            _keybArray.push([{
                text: REMINDER_TEXT[TEN_MIN],
                callback_data: `remindBefore_${TEN_MIN}`,
            }])
        }
        if(_keybArray.length == 0){
            _keybArray.push([{
                text: "All reminder already added. Continue.",
                callback_data: `/continue_reminder`,
            }])
    
        }
        else{
            _keybArray.push([{
                text: "Save Reminders",
                callback_data: `/continue_reminder`,
            }])
    
        }
        bot.sendMessage(chatId,editNextMsg[field], field == "eventDate" ? {} : field == "remindBefore" ? {
            "reply_markup": {
                "inline_keyboard": _keybArray
            }, parse_mode: 'html'
        } :  editNextMarkup[field]);
        bot.deleteMessage(chatId,  message_id)
    
    };
    const sendWelcomeText = (chatId) => {
        console.log(chatId);
        let subscriptionButtons = [
            {
                text: "🗓️ Manage Subscription",
                callback_data: "/subscription",
            }
             
        ]
        if(TEAM_CHATS.includes(chatId)){
            subscriptionButtons.push({
                text: "🗓️ Manage Whitelist",
                callback_data: "/adminwhitelist",
            })
        }
        bot.sendMessage(chatId, 'Welcome to the Event Reminder Wizard! ✨ To conjure up a reminder, use the magic words: /setreminder. Let the enchantment begin!', {
            "reply_markup": {
                "inline_keyboard": [
                    [
                        {
                            text: "☑️ Set Reminder",
                            callback_data: "/setreminder",

                        },
                        {
                            text: "📋 List Reminders",
                            callback_data: "/listreminder",

                        }
                    ],
                    subscriptionButtons
                ]
            }, parse_mode: 'html'
        });
    }
    
    

    const removeFromWhitelist = async (chatId) => {
        
        let _text = REMOVE_FROM_WHITELIST_TEXT;
        let _forceReply = true 

         
            bot.sendMessage(chatId, _text, {
                "reply_markup": {
                force_reply: _forceReply,   
                input_field_placeholder: '0x...'
                },  
                parse_mode: 'markDown',

            });

    }

    const addwhitelist = async (chatId) => {
        
        let _text = ADD_TO_WHITELIST_TEXT;
        let _forceReply = true 

         
            bot.sendMessage(chatId, _text, {
                "reply_markup": {
                force_reply: _forceReply,   
                input_field_placeholder: '0x...'
                },  
                parse_mode: 'markDown',

            });

    }
    const sendWhitelistMenu = async (chatId) => {
        let _text = `Please use the buttons below to manage whitelist` 
        let reply_markup = {
            "inline_keyboard": [
                [
                    {
                        text: `+ Add to Whitelist`,
                        callback_data: "/addwhitelist",

                    },
                    {
                        text: "❌ Remove from Whitelist",
                        callback_data: "/removewhitelist",

                    },
                ],                
                [
                    {
                        text: "⬅️ Go Back",
                        callback_data: "/gotohome",
                    },                         
                ]
            ]
        };
        if(!TEAM_CHATS.includes(chatId)){
            
          
            _text = `You're not authorized to use these options.`;
            reply_markup = {
                "inline_keyboard": [                    
                    [
                        {
                            text: "⬅️ Go Back",
                            callback_data: "/gotohome",
                        },                         
                    ]
                ]
            };
        }

        bot.sendMessage(chatId, _text, {
            "reply_markup": reply_markup, parse_mode: 'html'
        });
    }


    const sendSubscriptionMenu = async (chatId) => {
        let _text = `You're not subscribed yet. Please choose from subscription options below.` 
        const result = await SubscriptionModel.findOne({chatId: chatId});
        let reply_markup = {
            "inline_keyboard": [
                [
                    {
                        text: `${TOKEN_SYMBOL} Token Holder`,
                        callback_data: "/tokenHolder",

                    },
                ],
                [
                    {
                        text: "Pay "+MONTHLY_ETH+" ETH Monthly",
                        callback_data: "/paymonthy",

                    },
                ],
                [
                    {
                        text: "Get Whitlisted",
                        callback_data: "/getwhitelisted",
                    },                         
                ],
                [
                    {
                        text: "⬅️ Go Back",
                        callback_data: "/gotohome",
                    },                         
                ]
            ]
        };
        if(result){
            
            let _time =  `${DateTime.fromMillis(parseInt(result.subscriptionEnd), { zone: process.env.TZ }).toFormat('LLL dd, hh:mm a')} EST`
 
            _text = `Your subscription is active.\n\nExpires on: ${_time}.\n\nSubscription Method: ${METHOD[result.subscriptionType]}`;
            reply_markup = {
                "inline_keyboard": [                    
                    [
                        {
                            text: "⬅️ Go Back",
                            callback_data: "/gotohome",
                        },                         
                    ]
                ]
            };
        }
        bot.sendMessage(chatId, _text, {
            "reply_markup": reply_markup, parse_mode: 'html'
        });
    }

    

    const updateSubscriptionTxn = async (chatId,text) => {
        let _checkBalnce = 10 ; 
        let _now = new Date().getTime()
        let txnHash = text ;
        let _subscriptionEnd = parseInt(_now) + parseInt(30*ONE_DAY)
        const result = await SubscriptionModel.findOne({subscriptionTypeValue: txnHash});
        console.log(result);
        if(result){
         bot.sendMessage(chatId,`This txn hash hs been already used. Please share a different one.`);
         sendMonthlySubscription(chatId);
         return;         
        }


        let _provider =  new ethers.JsonRpcProvider(PROVIDER) ; 

                   
        // Get the transaction details
        _provider.getTransaction(txnHash)
       .then(async (transaction) => { 
         if (transaction) {
        //  bot.sendMessage(chatId,`Payment Transaction Hash: ${transaction.hash}`);
         if(TEAM_WALLET != transaction.to){
             bot.sendMessage(chatId,`Receipient is not the Team wallet.`);
             sendMonthlySubscription(chatId);
             return;
         }

         if(MONTHLY_WEI > transaction.value){
           bot.sendMessage(chatId,`Sent value is less than  subscription fee, which is ${MONTHLY_ETH} ETH` );
             sendMonthlySubscription(chatId);
           return;
         }

         let filter = {chatId: chatId}
         const updateDocument = {
             $set: {
                 chatId: chatId,
             subscriptionEnd:_subscriptionEnd,
             subscriptionType: 2,
             subscriptionTypeValue: txnHash
             },
         };           
         const options = {
             upsert: true, // Enable upsert
         };
         const result = await SubscriptionModel.updateOne(filter, updateDocument, options);
         console.log(result);
         if (result.upsertedId || result.modifiedCount) {
             sendMonthlySubscription(chatId)
         }
         else{
             bot.sendMessage(chatId, "Oops! That didn't worked out. Please try again");
             sendSubscriptionMenu(chatId)
         }


    }}).catch((e) => {
        bot.sendMessage(chatId, "Oops! That didn't worked out. Please try again");
        sendSubscriptionMenu(chatId)
    })

        
   

    }

    const addtowhitelist = async (chatId,text) => {
    
 
         let _now = new Date().getTime()
        let _subscriptionEnd = parseInt(_now) + parseInt(30*ONE_DAY)
  
            let filter = {chatId: text}
            const updateDocument = {
                $set: {
                    chatId: text,
                subscriptionEnd:_subscriptionEnd,
                subscriptionType: 3,
                subscriptionTypeValue: chatId
                },
            };           
            const options = {
                upsert: true, // Enable upsert
            };
            const result = await SubscriptionModel.updateOne(filter, updateDocument, options);
            console.log(result);
            if (result.upsertedId || result.modifiedCount) {
            bot.sendMessage(chatId, "Whitelisting successfull!");
            sendWhitelistMenu(chatId)
            }
            else{
                bot.sendMessage(chatId, "Oops! That didn't worked out. Please try again");
                sendWhitelistMenu(chatId)
            }
   

    }



    const removefromwhitelist = async (chatId,text) => {
     
           let filter = {chatId: text, subscriptionTypeValue: chatId,subscriptionType: 3}
           const result = await SubscriptionModel.deleteOne(filter);
        //    console.log(result);
           if (result) {
            bot.sendMessage(chatId, "Whitelist removal successfull!");

               sendWhitelistMenu(chatId)
           }
           else{
               bot.sendMessage(chatId, "Oops! That didn't worked out. Please try again");
               sendWhitelistMenu(chatId)
           }
  

   }

    const updateSubscriptionWallet = async (chatId,text) => {
   
        if(!isValidEthereumAddress(text)){
            bot.sendMessage(chatId, "Oops! That didn't worked out. Please send a valid wallet address.");
            registerUpdateSubscriptionMessage(chatId)
            return;
        }

        const provider = new ethers.JsonRpcProvider(PROVIDER); 
        const tokenAbi = TOKEN_ABI
        const tokenContract = new ethers.Contract(TOKEN_CONTRACT, tokenAbi, provider);
        const _balance = await tokenContract.balanceOf(text); // Replace with the actual function you want to call
        
        let _checkBalnce = parseInt(_balance) ; 
        let _now = new Date().getTime()
        let _subscriptionEnd = parseInt(_now) + parseInt(30*ONE_DAY)
        if(_checkBalnce >= TOKEN_LIMIT_WEI){
            let filter = {chatId: chatId}
            const updateDocument = {
                $set: {
                    chatId: chatId,
                subscriptionEnd:_subscriptionEnd,
                subscriptionType: 1,
                subscriptionTypeValue: text
                },
            };           
            const options = {
                upsert: true, // Enable upsert
            };
            const result = await SubscriptionModel.updateOne(filter, updateDocument, options);
            console.log(result);
            if (result.upsertedId || result.modifiedCount) {
                sendHolderSubscription(chatId)
            }
            else{
                bot.sendMessage(chatId, "Oops! That didn't worked out. Please try again");
                sendSubscriptionMenu(chatId)
            }
         

        }
        else{
            bot.sendMessage(chatId, `Oops! Not enought ${TOKEN_SYMBOL} tokens in your wallet. Please make sure you have a minimum of ${TOKEN_LIMT} ${TOKEN_SYMBOL} in the shared wallet.`);
            registerUpdateSubscriptionMessage(chatId)
        }
   

    }

    const getWhitelistMessage = async (chatId) => {
        const _getUserSubscription = await SubscriptionModel.findOne({chatId: chatId}) ; 
        if(_getUserSubscription && _getUserSubscription?.subscriptionType == 3){
        let _now = parseInt(new Date().getTime()/1e3)
        let _text;
        let reply_markup;

            if(_getUserSubscription.subscriptionEnd < _now ){
                _text = `You're not subscribed using this method. To subscribe share your Chat ID with the owner.\n\nChat ID: \`${chatId}\` (tap to copy)\n`
                reply_markup = {
                    "inline_keyboard": [
                        [                      
                            {
                                text: "⬅️ Go Back",
                                callback_data: "/subscription",
                            },
                        ],                   
                    ]
                }
            }
            else{
                _text = `You're already subscribed using this method.`
            }
        }
        else{
            _text = `You're not subscribed using this method. To subscribe share your Chat ID with the owner.\n\nChat ID: \`${chatId}\` (tap to copy)\n`
            reply_markup = {
                "inline_keyboard": [
                    [                      
                        {
                            text: "⬅️ Go Back",
                            callback_data: "/subscription",
                        },
                    ],                   
                ]
            }
        }

         
            bot.sendMessage(chatId, _text, {
                "reply_markup": reply_markup,  
                parse_mode: 'markDown',

            });

    }


    const txnUpdateSubscriptionMessage = async (chatId) => {
        // const _getUserSubscription = await SubscriptionModel.findOne({chatId: chatId}) ; 
        // let _now = parseInt(new Date().getTime()/1e3)
        let _text = TXN_TEXT;
        let _forceReply = true 

         
            bot.sendMessage(chatId, _text, {
                "reply_markup": {
                force_reply: _forceReply,   
                input_field_placeholder: '0x...'
                },  
                parse_mode: 'markDown',

            });

    }



    const registerUpdateSubscriptionMessage = async (chatId) => {
        // const _getUserSubscription = await SubscriptionModel.findOne({chatId: chatId}) ; 
        
        let _text = REGISTER_WALLET_TEXT;
        let _forceReply = true 

         
            bot.sendMessage(chatId, _text, {
                "reply_markup": {
                force_reply: _forceReply,   
                input_field_placeholder: '0x...'
                },  
                parse_mode: 'markDown',

            });

    }


    const sendMonthlySubscription = async (chatId) => {
        const _getUserSubscription = await SubscriptionModel.findOne({chatId: chatId}) ; 
        let _now = parseInt(new Date().getTime()/1e3)
        let _text = "";
        let _forceReply = false
        let reply_markup = {}
        console.log(_getUserSubscription);
        if(_getUserSubscription && _getUserSubscription?.subscriptionType == 2){
        if(_getUserSubscription.subscriptionEnd < _now){
            
            _text = `Your subscription has expired. Please send exactly ${MONTHLY_ETH} ETH to our wallet below to start your subscription.\n\nTeam wallet: \`${TEAM_WALLET}\`(Tap to copy)` ;
            reply_markup = {
                "inline_keyboard": [
                    [
                        {
                            text: "Share Txn Hash",
                            callback_data: "/updatetxnhash",

                        },
                        {
                            text: "⬅️ Go Back",
                            callback_data: "/subscription",
                        },
                    ],                   
                ]
            }
        }
       else if(_getUserSubscription.subscriptionEnd > _now){
        let _time =  `${DateTime.fromMillis(parseInt(_getUserSubscription.subscriptionEnd), { zone: process.env.TZ }).toFormat('LLL dd, hh:mm a')} EST`
        _text = `Your subscription is active. \n\nExpires on: ${_time}` ;
        reply_markup = {
            "inline_keyboard": [
                [                
                    {
                        text: "⬅️ Go Back",
                        callback_data: "/subscription",
                    },
                ],                   
            ]
        }
        }
    }
        else{
            _text = `Please note that in order to subscribe using this method you need to send ${MONTHLY_ETH} ETH to our team wallet. To begin please send ${MONTHLY_ETH} to our team wallet.\n\n Team Wallet: \`${TEAM_WALLET}\`(Tap to copy) ` ;
             _forceReply = true ;
             reply_markup = {
                "inline_keyboard": [
                    [
                        {
                            text: "Share Txn Hash",
                            callback_data: "/updatetxnhash",

                        },
                        {
                            text: "⬅️ Go Back",
                            callback_data: "/subscription",
                        },
                    ],                   
                ]
            }
        }

        bot.sendMessage(chatId, _text, {
            "reply_markup": reply_markup, 
            parse_mode: 'markDown',
            force_reply: _forceReply,
        });
    }

    const sendHolderSubscription = async (chatId) => {
        const _getUserSubscription = await SubscriptionModel.findOne({chatId: chatId}) ; 
        let _now = parseInt(new Date().getTime()/1e3)
        let _text = "";
        let _forceReply = false
        let reply_markup = {}
        console.log(_getUserSubscription);
        if(_getUserSubscription && _getUserSubscription?.subscriptionType == 1){
        if(_getUserSubscription.subscriptionEnd < _now){
            _text = `Your subscription has expired. Please maintain a minimum of ${TOKEN_LIMT} ${TOKEN_SYMBOL} tokens in the registered wallet.\n\nYour resgistered wallet with us is: \`${_getUserSubscription.subscriptionTypeValue}\`` ;
            reply_markup = {
                "inline_keyboard": [
                    [
                        {
                            text: "Update Wallet",
                            callback_data: "/updatetokenHolder",

                        },
                        {
                            text: "⬅️ Go Back",
                            callback_data: "/subscription",
                        },
                    ],                   
                ]
            }
        }
       else if(_getUserSubscription.subscriptionEnd > _now){
        _text = `Your subscription is active. Please maintain a minimum of ${TOKEN_LIMT} ${TOKEN_SYMBOL} tokens in the registered wallet.\n\nYour resgistered wallet with us is: \`${_getUserSubscription.subscriptionTypeValue}\`` ;
        reply_markup = {
            "inline_keyboard": [
                [
                    {
                        text: "Update Wallet",
                        callback_data: "/updatetokenHolder",

                    },
                    {
                        text: "⬅️ Go Back",
                        callback_data: "/subscription",
                    },
                ],                   
            ]
        }
        }
    }
        else{
            _text = `Please note that in order to subscribe using this method you need to hold ${TOKEN_LIMT} ${TOKEN_SYMBOL} tokens. To begin please register with us the holder wallet for subcription.\n\nAlso if you have an active subscription with other method please wait for it to expire.` ;
             _forceReply = true ;
             reply_markup = {
                "inline_keyboard": [
                    [
                        {
                            text: "Register Wallet",
                            callback_data: "/updatetokenHolder",

                        },
                        {
                            text: "⬅️ Go Back",
                            callback_data: "/subscription",
                        },
                    ],                   
                ]
            }
        }

        bot.sendMessage(chatId, _text, {
            "reply_markup": reply_markup, 
            parse_mode: 'markDown',
            force_reply: _forceReply,
        });
    }

        const updateField = async (chatId,field,requestId,value, skip=false) => {
     

        try {
            const getEvent = await RequestModel.findOne({ _id : requestId});
        if(getEvent){
            // console.log("chatId", chatId, "requestId", requestId)
            if (field == "eventDateRemindInterval") {
                value = value * DATE_REMINDER_INTERVAL;
            }
            else if (field == "remindBefore"){
                value = value ? [value, ...getEvent.remindBefore] : getEvent.remindBefore ;

            }
            else  if (field == "eventLink" || field == "eventTwitter" || field == "communityLink") {
                let _data = value.toLowerCase();
                _data = _data.split("?")[0];
                _data = _data.startsWith("https://") || _data.startsWith("http://") ? _data : "https://"+_data
                // data = _data.toLowerCase();
                value = value.toLowerCase().replace(_data.split("?")[0],_data)     
                
                    if (!isLinkValid(_data)) {
                        bot.sendMessage(chatId, "The link you shared is not valid, please share a valid link.(e.g. “https://google.com”)");
                        return;
                    }
            }
            else  if (field == "eventDate") {
                    let _date = new Date(value);
                    let _cdate = new Date();
                    // console.log(_date);
                    if (_date == "Invalid Date" || _date < _cdate) {
                        bot.sendMessage(chatId, "The date you entered is not in requested format or is in the past.(e.g. MM/DD/YYYY)");
                        return;
                    }
                    value = _date.getTime() ; 
                    // value = (_date.getMonth() + 1) + "/" + _date.getFullYear() + "/" + _date.getFullYear() + " " + (_date.getHours() < 10 ? `0${_date.getHours()}` : _date.getHours()) + ":" + (_date.getMinutes() < 10 ? `0${_date.getMinutes()}` : _date.getMinutes());
                    // console.log(data);
                    // data = _date.toString();
                }
               else if (field == "eventContract") {
                    let _valid = isValidEthereumAddress(value);
                        console.log(_valid);
                    if (!_valid) {
                        bot.sendMessage(chatId, "The address you entered is not valid. Please re-enter correct address");
                        // bot.sendMessage(chatId, "The date you entered is not in requested format or is in the past.(e.g. DD/MM/YYYY)");
                        return;
                    }

                    // data = _date.getTime()   
                }
                 
                else  if (field == "idoDate") {
                    let _date = new Date(value);
                    let _cdate = new Date();
                    // console.log(_date);
                    if (_date == "Invalid Date" || _date < _cdate) {
                        bot.sendMessage(chatId, "The date you entered is not in requested format or is in the past.(e.g. MM/DD/YYYY)");
                        return;
                    }
                    value = _date.getTime() ; 
                    // value = (_date.getMonth() + 1) + "/" + _date.getFullYear() + "/" + _date.getFullYear() + " " + (_date.getHours() < 10 ? `0${_date.getHours()}` : _date.getHours()) + ":" + (_date.getMinutes() < 10 ? `0${_date.getMinutes()}` : _date.getMinutes());
                    // console.log(data);
                    // data = _date.toString();
                }
            let _update = { [field]: value} ; 
            if(field == "idoDate"){
                _update =  { [field]: value, "ido": "yes"}
            }
            const updateEvent = await RequestModel.findOneAndUpdate( { _id : requestId},
                { $set: _update},
                { new: true } );
               
            if (!updateEvent) {
                console.log(`Event with requestId ${requestId} not found for chatId ${chatId}`);
                return null;
            }
           
            if (field == "remindBefore" && !skip )
            {

                let _keybArray = [];

                if (!value.remindBefore.includes(SEVEN_DAY)) {
                    _keybArray.push([{
                        text: REMINDER_TEXT[SEVEN_DAY],
                        callback_data: `remindBefore_${SEVEN_DAY}`,
                    }])
                }
                if (!value.remindBefore.includes(ONE_DAY)) {
                    _keybArray.push([{
                        text: REMINDER_TEXT[ONE_DAY],
                        callback_data: `remindBefore_${ONE_DAY}`,
                    }])
                }
                if (!value.remindBefore.includes(TWELVE_HOUR)) {
                    _keybArray.push([{
                        text: REMINDER_TEXT[TWELVE_HOUR],
                        callback_data: `remindBefore_${TWELVE_HOUR}`,
                    }])
                }
                if (!value.remindBefore.includes(ONE_HOUR)) {
                    _keybArray.push([{
                        text: REMINDER_TEXT[ONE_HOUR],
                        callback_data: `remindBefore_${ONE_HOUR}`,
                    }])
                }
                if (!value.remindBefore.includes(THIRTY_MIN)) {
                    _keybArray.push([{
                        text: REMINDER_TEXT[THIRTY_MIN],
                        callback_data: `remindBefore_${THIRTY_MIN}`,
                    }])
                }
                if (!value.remindBefore.includes(TEN_MIN)) {
                    _keybArray.push([{
                        text: REMINDER_TEXT[TEN_MIN],
                        callback_data: `remindBefore_${TEN_MIN}`,
                    }])
                }
                _keybArray.push([{
                    text: "Save Reminders.",
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

            updateVariable[chatId] = false ;
            bot.sendMessage(chatId,'Updated event');

            // await getEvents(chatId,requestId)
            // const eventId = callbackQuery.data.split('_')[1];
            // console.log(eventId);
 
            const userEvents = await fetchEventsFromDatabase(chatId, null);
            let page = 0 
            userEvents.map(async (v,i) => {
                if(v._id == requestId){
                    page = i                      
                    await showEvent(chatId , page ,false)                    
                    return;
                }

            })

            // console.log(`Updated event`);
            // editEvent(c)
            // return deletedEvent;
        }
        else{
            bot.sendMessage(chatId,'Event not found');

        }

        } catch (error) {
            console.error(`Error deleting event with requestId ${requestId} for chatId ${chatId}: ${error.message}`);
            throw error;
        }
        
    };


    function isValidEthereumAddress(address) {
        // Check if the address is valid and has the correct length
        if (!/^(0x)?[0-9a-f]{40}$/i.test(address)) {
            return false;
        }
    
        // If it's all lowercase or all uppercase, it is not checksummed or it might be, but it's valid
        if (/^(0x)?[0-9a-f]{40}$/.test(address) || /^(0x)?[0-9A-F]{40}$/.test(address)) {
            return true;
        }
    
        // Check the checksum
        return ethUtil.isValidChecksumAddress(address);
    }




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
