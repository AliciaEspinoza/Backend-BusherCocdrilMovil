const mongoose = require('mongoose');
const schema = mongoose.Schema;

const clientModel = new schema({
    nombre : { type : String, required : true, trim: true},
    categoria : { type : String, required : true, trim: true},
    estatus : { type : String, required : true, trim: true},
});

const client = mongoose.model('Clientes', clientModel);

module.exports = client;