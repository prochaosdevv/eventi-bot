const RequestModel = require('../models/requestsModel');
const EventReminder = require('../models/eventReminderModel')
const EventDateReminder = require('../models/EventDateReminderModel')

// const bot = require('../routes/botRoutes');

// botRotues.get('/'


async function checkAndSendReminders(bot) {
    try {
      console.log("running inside");

      const allRequests = await RequestModel.find();
      // console.log(allRequests);
      for (const request of allRequests) {
        const { eventDate, remindBefore, _id,chatId } = request;
        console.log("eventDate, remindBefore, _id", eventDate, remindBefore, _id.toString());
  
        const eventTimestamp = new Date(parseInt(eventDate)).getTime();
        console.log(eventTimestamp);
  
        for (const interval of remindBefore) {
          const reminderTimestamp = eventTimestamp - parseInt(interval, 10);
          console.log("reminderTimestamp", reminderTimestamp);
  
          try {
            const existingReminder = await EventReminder.findOne({
              requestId: _id.toString(),
              remindBefore: interval,
            });
  
            if (!existingReminder && reminderTimestamp <= Date.now()) {
              console.log("date.now", Date.now());
              console.log(`Sending reminder for event at ${new Date(reminderTimestamp)}`);
  
           //bot msg
           bot.sendMessage(chatId, `Upcoming Event\n\n Project Name: ${request.eventName}`);         

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
  
  async function sendReminderForSetEventDate() {
    try {
      const requests = await RequestModel.find({ eventDate: "false" });
  
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

        const reminderTimestamp = _lastReminder + eventDateRemindIntervalInMilliseconds;

        try {
         
  
          if (Date.now() > reminderTimestamp) {
            console.log(`Sending reminder for event at ${new Date(reminderTimestamp)}`);

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