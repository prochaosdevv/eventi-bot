const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const uri = "mongodb+srv://" + process.env.DB_USER + ":" + process.env.DB_PASSWORD + "@" + process.env.DB_URI + "/eventreminder?retryWrites=true&w=majority";


const connectDatabase = () => {
    mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
        .then(() => {
            console.log("Mongo DB Connected");
        }).catch((error) => {
            console.log(error);
        });
}

module.exports = connectDatabase;
