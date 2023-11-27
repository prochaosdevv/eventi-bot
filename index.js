const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const mongoose = require('mongoose');
const connectDatabase = require('./utils/dbConnection');
connectDatabase();

const botRotues = require("./routes/botRoutes");

const app = express();
const port = process.env.PORT || 3000;

app.use("/bot" , botRotues)

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});