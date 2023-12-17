const RequestModel = require('../models/requestsModel');
const EventReminder = require('../models/eventReminderModel')
const EventDateReminder = require('../models/EventDateReminderModel');
const { DateTime } = require("luxon");
 

// const bot = require('../routes/botRoutes');

// botRotues.get('/'
  const capitalizeFirstLetter = (str) => {
        return str.charAt(0).toUpperCase() + str.slice(1);
    };
    const capitalizeAllLetters = (str) => {
      return str.toUpperCase();
  }
  
async function checkAndSendReminders(bot) {
    try {
      console.log("running inside");

      const allRequests = await RequestModel.find();
      // console.log(allRequests);
      for (const request of allRequests) {
        const { eventDate, remindBefore, _id,chatId } = request;
        // console.log("eventDate, remindBefore, _id", eventDate, remindBefore, _id.toString());
  
        const eventTimestamp = new Date(parseInt(eventDate)).getTime();
        // console.log(eventTimestamp);
  
        for (const interval of remindBefore) {
          const reminderTimestamp = eventTimestamp - parseInt(interval, 10);
          // console.log("reminderTimestamp", reminderTimestamp);
  
          try {
            const existingReminder = await EventReminder.findOne({
              requestId: _id.toString(),
              remindBefore: interval,
            });
  
            if (!existingReminder && reminderTimestamp <= Date.now()) {
              // console.log("date.now", Date.now());
              console.log(`Sending reminder for event at ${new Date(reminderTimestamp)}`);
  
           //bot msg
           let _text = "🚨⚠️ LAUNCH REMINDER ⚠️🚨\n\n" ; 
           _text += `📃 Project Name: ${request.eventName}\n` +
           `🔗 Project Chain: ${capitalizeAllLetters(request.eventChain)}\n` +
           `🔁 Platform: ${capitalizeFirstLetter(request.eventPad)}\n` ;
           if((request?.ido)?.toLowerCase() == "yes"){
            _text += `🚀 Private Sale: ${((request.ido).toUpperCase())}\n`;
            
               _text += `📆 IDO Date: ${request.idoDate && request.idoDate !== 'false'? `${DateTime.fromMillis(parseInt(request.idoDate), { zone: process.env.TZ }).toFormat('LLL dd, hh:mm a')} EST` : 'Not Set'}\n`;        
           }
           else{
            _text += `🚀 Private Sale: No\n`;
           }
           // `🗓️ Event Date Time: ${event.eventDate && event.eventDate != 'false' ? `${(new Date(parseInt(event.eventDate)).toLocaleString())} EST` : 'Not Set'}` +
           _text +=    `🗓️ Event Date Time: ${request.eventDate && request.eventDate !== 'false'
          ? ` ${DateTime.fromMillis(parseInt(request.eventDate), { zone: process.env.TZ }).toFormat('LLL dd, hh:mm a')} EST`
           : 'Not Set'}` ;
          //  `\n${request.remindBefore.map((reminder, index) => `⏰ Reminder #${index + 1}: ${REMINDER_TEXT[Number(reminder)]}`).join('\n')}` +
          //  `${!request.eventDate  || request.eventDate == 'false' ? `\n⏰ Event Date Reminder: Every ${request.eventDateRemindInterval / ONE_DAY} days` : ''}\n\n`;
          _text += `\n📝 Notes: ${(request.eventNotes == 'false' ? "Not Set" : capitalizeFirstLetter(request.eventNotes))}\n`;
          _text += `📑 Contract: ${(request.eventContract == 'false' ? "Not Set" : "`"+request.eventContract+"` (Tap to copy)")}\n`;
           let linksMarkup = [];
        if (request.eventLink &&  request.eventLink != 'false') {
            linksMarkup.push({
                text: "💻Website",
                url: request.eventLink,
            });
        }
        if (request.eventTwitter &&  request.eventTwitter != 'false') {
            linksMarkup.push({
                text: "🐦Twitter",
                url: request.eventTwitter
            })
        }
        if (request.communityLink &&  request.communityLink != 'false' ) {
            let communityText = '👥Discord';
            let _communityLink = request.communityLink.toLowerCase();
            if (_communityLink.includes("t.me") || _communityLink.includes("telegram")) {
                communityText = '👥Telegram ';
            }
            linksMarkup.push({
                text: communityText,
                url: request.communityLink
    
            })
        }
        const keyboard = {
          inline_keyboard: [
              linksMarkup,             
          ],
      }; 

           bot.sendMessage(chatId, _text , {
            parse_mode: 'markdown',
            reply_markup: keyboard,
        });   

              const newReminder = new EventReminder({
                requestId: _id.toString(),
                remindBefore: interval,
              });
              await newReminder.save();
            }
          } catch (error) {
            console.error('Error querying or saving to EventReminder:', error);
          }
        }
      }
  
      console.log('out side Reminders checked and sent successfully.');
    } catch (error) {
      console.error('Error checking and sending reminders:', error);
    }
  }
  
  async function sendReminderForSetEventDate(bot) {
    try {
      const requests = await RequestModel.find({ eventDate: "false" });
      console.log(requests.length);
      requests.forEach(async (request) => {
        const chatId = request.chatId; 
        const eventDateRemindIntervalInMilliseconds = parseInt(request.eventDateRemindInterval, 10);
        const createdAtTimestamp = new Date(request.createdAt).getTime();
        const existingReminder = await EventDateReminder.findOne({
          requestId: request._id.toString()
        }).sort({createdAtTimestamp : -1});
        let _lastReminder = createdAtTimestamp ; 
        if (existingReminder){
          _lastReminder = new Date(existingReminder.eventDateRemindInterval)
        }
        // _lastReminder = new Date().getTime() - (4 * 86400000)
        const reminderTimestamp = _lastReminder + eventDateRemindIntervalInMilliseconds;
        console.log(reminderTimestamp);
        try {
         
  
          if (Date.now() > reminderTimestamp) {
            console.log(`Sending reminder for event at ${new Date(reminderTimestamp)}`);
            let _text = "🚨⚠️ SET EVENT DATE REMINDER ⚠️🚨\n\n" ; 
            _text += `📃 Project Name: ${request.eventName}\n` +
            `🔗 Project Chain: ${capitalizeAllLetters(request.eventChain)}\n` +
            `🔁 Platform: ${capitalizeFirstLetter(request.eventPad)}\n` ;
            if((request?.ido)?.toLowerCase() == "yes"){
             _text += `🚀 Private Sale: ${((request.ido).toUpperCase())}\n`;
             
                _text += `📆 IDO Date: ${request.idoDate && request.idoDate !== 'false' ? `${DateTime.fromMillis(parseInt(request.idoDate), { zone: process.env.TZ }).toFormat('LLL dd, hh:mm a')} EST` : 'Not Set'}\n`;        
            }
            else{
             _text += `🚀 Private Sale: No\n`;
            }
            // `🗓️ Event Date Time: ${event.eventDate && event.eventDate != 'false' ? `${(new Date(parseInt(event.eventDate)).toLocaleString())} EST` : 'Not Set'}` +
            _text +=    `🗓️ Event Date Time: ${request.eventDate && request.eventDate !== 'false'
           ? ` ${DateTime.fromMillis(parseInt(request.eventDate), { zone: process.env.TZ }).toFormat('LLL dd, hh:mm a')} EST`
            : 'Not Set'}` ;
           //  `\n${request.remindBefore.map((reminder, index) => `⏰ Reminder #${index + 1}: ${REMINDER_TEXT[Number(reminder)]}`).join('\n')}` +
           //  `${!request.eventDate  || request.eventDate == 'false' ? `\n⏰ Event Date Reminder: Every ${request.eventDateRemindInterval / ONE_DAY} days` : ''}\n\n`;
           _text += `\n📝 Notes: ${(request.eventNotes == 'false' ? "Not Set" : capitalizeFirstLetter(request.eventNotes))}\n`;
           _text += `📑 Contract: ${(request.eventContract == 'false' ? "Not Set" : "`"+request.eventContract+"` (Tap to copy)")}\n`;
            let linksMarkup = [];
         if (request.eventLink &&  request.eventLink != 'false') {
             linksMarkup.push({
                 text: "💻Website",
                 url: request.eventLink,
             });
         }
         if (request.eventTwitter &&  request.eventTwitter != 'false') {
             linksMarkup.push({
                 text: "🐦Twitter",
                 url: request.eventTwitter
             })
         }
         if (request.communityLink &&  request.communityLink != 'false' ) {
             let communityText = '👥Discord';
             let _communityLink = request.communityLink.toLowerCase();
             if (_communityLink.includes("t.me") || _communityLink.includes("telegram")) {
                 communityText = '👥Telegram ';
             }
             linksMarkup.push({
                 text: communityText,
                 url: request.communityLink
     
             })
         }
         const keyboard = {
           inline_keyboard: [
               linksMarkup,  
               [{ text: 'Set Date', callback_data: `/editfield_eventDate_${request._id}` }]           
           ],
       }; 
 
            bot.sendMessage(chatId, _text , {
             parse_mode: 'markdown',
             reply_markup: keyboard,
         });   


            // bot msg 
            
            const _now = new Date().getTime();
            const newReminder = new EventDateReminder({
              requestId: request._id.toString(),
              eventDateRemindInterval: _now,
            });
  
            await newReminder.save();
          }
        } catch (error) {
          console.error('Error checking or inserting to EventDateReminder:', error);
        }
      });
  
    } catch (error) {
      console.error('Error sending reminder:', error);
    }
  }
  

  
module.exports = {
    checkAndSendReminders,
    sendReminderForSetEventDate
    
  };


















  

// async function checkAndSendReminders() {
//     try {

//       const allRequests = await RequestModel.find();
//       for (const request of allRequests) {
//         const { eventDate, remindBefore, _id } = request;
//         console.log("eventDate, remindBefore, _id", eventDate, remindBefore, _id.toString());
  
//         const eventTimestamp = new Date(eventDate).getTime();
//         console.log(eventTimestamp)
  
        
//         for (const interval of remindBefore) {
//           const reminderTimestamp = eventTimestamp - parseInt(interval, 10);

//           console.log("reminderTimestamp",reminderTimestamp)
               
//           EventReminder.findOne
        
//           if (reminderTimestamp <= Date.now()) {
//             console.log("date.now",Date.now())
//             console.log(`Sending reminder for event at ${new Date(reminderTimestamp)}`);
//           }
//         }
//       }
  
//       console.log('out side loop Reminders checked and sent successfully.');
//     } catch (error) {
//       console.error('Error checking and sending reminders:', error);
//     }
//   }

















// async function checkAndSendReminders() {
//     try {
//       const allRequests = await RequestModel.find();
  
//       allRequests.forEach(async (request) => {
//         const eventDate = moment.tz(request.eventDate, 'MM/DD/YYYY HH:mm', 'America/New_York');
//         console.log("eventDate",eventDate)
//         const currentDateTime = moment().tz('America/New_York');
//         console.log("currentDateTime",currentDateTime)
//         const remindTimes = request.remindBefore.map((remindMilliseconds) => {
//             console.log("request.remindBefore",request.remindBefore)
//             console.log("remindMilliseconds",remindMilliseconds)
//           return moment(eventDate).subtract(remindMilliseconds, 'milliseconds');
//         });
  
//         const isWithinRemindTimeframe = remindTimes.some((remindTime) => {
//           return currentDateTime.isBetween(remindTime, eventDate);
//         });
  
//         console.log('isWithinRemindTimeframe', isWithinRemindTimeframe);
//         if (isWithinRemindTimeframe) {
//           try {
//             console.log(`Sending reminder for eventId ${request._id}`);
//             const chatId = request.chatId;
//             console.log("chatId",chatId)
//             // const message = `Reminder for event '${request.eventName}' - Set the event date!`;
//             //  bot.sendMessage(chatId, message);
//           } catch (error) {
//             console.error('Error sending reminder:', error);
//           }
//         }
//       });
//     } catch (error) {
//       console.error('Error checking and sending reminders:', error);
//     }
//   }
  
  






// async function checkAndSendReminders() {
//     try {
//       // Fetch all documents from the RequestModel
//       const allRequests = await RequestModel.find();
  
//       // Loop through each request
//       allRequests.forEach(request => {
//         // Parse the eventDate from the request and set the timezone to EST
//         const eventDate = moment.tz(request.eventDate, 'MM/DD/YYYY HH:mm', 'America/New_York');
//         console.log("eventDate",eventDate)
  
//         // Get the current date in Eastern Standard Time (EST)
//         const currentDate = moment().tz('America/New_York').startOf('day'); // Consider only the date part
//         console.log("currentDate",currentDate)
//         // Calculate the remind times based on the remindBefore array
//         const remindTimes = request.remindBefore.map(remindMilliseconds => {
//             console.log(" request.remindBefore", request.remindBefore)
//             console.log("remindMilliseconds", remindMilliseconds)
//           return moment(eventDate).subtract(remindMilliseconds, 'milliseconds').startOf('day');
//         });
  
//         // Check if the current date is within any of the remind date timeframes
//         const isWithinRemindTimeframe = remindTimes.some(remindDate => {
//           return currentDate.isSame(remindDate);
//         });
  

//         console.log("isWithinRemindTimeframe",isWithinRemindTimeframe)
//         // If within remind timeframe, send a reminder
//         if (isWithinRemindTimeframe) {
//           console.log(`Sending reminder for eventId ${request._id}`);
//           // Add your reminder sending logic here
//         }
//       });
//     } catch (error) {
//       console.error('Error checking and sending reminders:', error);
//     }
//   }
  
  





  

// async function checkAndSendReminders() {
//     try {
     
//       const allRequests = await RequestModel.find();

//     //   console.log("request.eventDate",allRequests.eventDate)
  
//       allRequests.forEach(request => {
//         console.log("request.eventDate",request.eventDate)
//         const eventDate = moment.tz(request.eventDate, 'MM/DD/YYYY HH:mm', 'America/New_York');
//         console.log("eventDate",eventDate)
  
//         const currentDateTime = moment().tz('America/New_York');
//         console.log("currentDateTime",currentDateTime)
  
    
//         const remindTimes = request.remindBefore.map(remindMilliseconds => {
//             console.log(" request.remindBefore", request.remindBefore)
//             console.log("remindMilliseconds",remindMilliseconds)
//           return moment(eventDate).subtract(remindMilliseconds, 'milliseconds');
//         });
  
    
      
//         const isWithinRemindTimeframe = remindTimes.some(remindTime => {
//           return currentDateTime.isBetween(remindTime, eventDate);
//           try {
//             // Add your reminder sending logic here
//             console.log(`Sending reminder for eventId ${request._id}`);
  
//             // Example: Send a reminder message using Telegram bot
//             const chatId = request.chatId; // Replace with the actual chat ID from your database
//             const message = `Reminder for event '${request.eventName}' - Set the event date!`;
  
//             // Send the reminder message using the bot instance
//             await bot.sendMessage(chatId, message);
  
//             // Once the reminder is sent, you may want to update the database or perform any other necessary actions
//             // For example, you can set a flag in the database to mark that the reminder has been sent
//             // Update the 'request' document in the database, e.g., request.reminded = true;
//             // await request.save();
//           } catch (error) {
//             console.error('Error sending reminder:', error);
//           }
//         });
  
//         console.log("isWithinRemindTimeframe",isWithinRemindTimeframe)
//         if (isWithinRemindTimeframe) {
//           console.log(`Sending reminder for eventId ${request._id}`);
//         }
//       });
//     } catch (error) {
//       console.error('Error checking and sending reminders:', error);
//     }
//   }