const mongoose = require('mongoose');
const schema = mongoose.Schema;

const orderModel = new schema({
    folio : { type : String, required : true, trim : true },
    nombre : { type : String, required : true, trim : true },
    fecha_orden : { type : String, required : true, trim: true},
    hora_orden : { type : String, required : true, trim: true},
    costo_unitario : { type : Number, required : true, trim : true },
    cantidad_productos : { type : Number, required : true, trim : true },
    subtotal : { type : Number, required : true, trim : true },
    notas : { type : String, required : true, trim : true },
    estatus : { type : String, required : true, trim : true },
});

const order = mongoose.model('Ordenes', orderModel);

module.exports = order;