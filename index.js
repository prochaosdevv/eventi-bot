const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const mongoose = require('mongoose');
const connectDatabase = require('./utils/dbConnection');
connectDatabase();

const botRotues = require("./routes/botRoutes");

const app = express();
const port = process.env.PORT || 3000;

app.use("/bot" , botRotues)


setInterval(() => {

  let config = {
    method: 'get',
    maxBodyLength: Infinity,
    url: 'https://d2zrc5jha5uuzj.cloudfront.net/bot',
    headers: { }
  };
  
  axios.request(config)
  .then((response) => {
    console.log(JSON.stringify(response.data));
  })
  .catch((error) => {
    console.log(error.stack);
    console.log(error.message);
  });
  
  }, 600000);
  


// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});