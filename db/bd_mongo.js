const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

async function connectToMongoDB(){
    try{
        await mongoose.connect(process.env.DB_URL);
        console.log('Conecction to mongodb');
    }catch(err){
        console.error('Error to connect mongodb');
    }
};

module.exports = connectToMongoDB;