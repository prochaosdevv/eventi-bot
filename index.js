const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const mongoose = require('mongoose');
const cron = require('node-cron');
const connectDatabase = require('./utils/dbConnection');
connectDatabase();
const axios = require('axios');

const botRotues = require("./routes/botRoutes");
// const {sendReminderForSetEventDate} = require('./controllers/reminderController')

const app = express();
const port = process.env.PORT || 3000;

app.use("/bot" , botRotues)

console.log(`https://api.telegram.org/bot${process.env.TG_BOT_SECRET}/setWebhook?url=${process.env.URL}`);


// cron.schedule('*/1 * * * *', () => {
cron.schedule('*/10 * * * * *', () => {
  console.log("cron running");
  try{
    botRotues.checkAndSendReminders();
  }
  catch(e){
    console.log(e);
  }
});


// cron.schedule('*/1 * * * *', () => {
//   sendReminderForSetEventDate();
// });


setInterval(() => {
  try{
    // console.log("here");
  let config = {
    method: 'get',
    maxBodyLength: Infinity,    
    url: process.env.URL,
    headers: { },
    
  };
  
  axios.request(config)
  .then((response) => {
    // console.log(JSON.stringify(response.data));
  })
  .catch((error) => {
    console.log(error.stack);
    console.log(error.message);
  });
}
 catch(e){
  console.log(e);
 }
  }, 5000);
  


// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});