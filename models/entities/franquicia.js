const mongoose = require('mongoose');
const schema = mongoose.Schema;

const franchiseModel = new schema({
    nombre : { type : String, required : true, trim: true},
    descripcion : { type : String, required : true, trim: true},
    email : { type : String, required : true, trim: true},
    telefono : { type : String, required : true, trim: true},
    ciudad : { type : String, required : true, trim: true},
    colonia : { type : String, required : true, trim: true},
    direccion : { type : String, required : true, trim: true},
    estatus : { type : String, required : true, trim: true},
    fecha_registro : { type : String, required : true, trim: true},
    hora_registro : { type : String, required : true, trim: true},
});

const franchise = mongoose.model('Franquicias', franchiseModel);

module.exports = franchise;