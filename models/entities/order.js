const mongoose = require('mongoose');
const schema = mongoose.Schema;

const orderModel = new schema({
    id_franquicia : { type : mongoose.Schema.Types.ObjectId, ref : 'Franquicias' ,required : true, trim : true },
    folio : { type : String, required : true, trim : true },
    nombre_cliente : { type : String, required : true, trim : true },
    tipo_orden : { type : String, required : true, trim : true },
    iva : { type : Number, default : 0, trim : true },
    subtotal : { type : Number, default : 0, trim : true },
    total : { type : Number, default : 0, trim : true },
    fecha_registro : { type : String, required : true, trim: true},
    hora_registro : { type : String, required : true, trim: true},
    mesa : { type : Number, default : 0, trim : true },
    mesero : { type : mongoose.Schema.Types.ObjectId, ref : 'Empleados', required : true},
    estatus : { type : String, required : true, trim : true },

    //contenido de la orden
    productos : [{
        id_producto : { type : mongoose.Schema.Types.ObjectId, required : true, trim : true },
        id_menu : { type : mongoose.Schema.Types.ObjectId, ref : 'Menus' ,required : true, trim : true },
        cantidad : { type : Number, required : true },
        subtotal : { type : Number, required : true, default : 0 },
        notas : { type : String, trim : true },
        ingredientes_extra : [{
            descripcion : { type : String, required : true, trim : true },
            costo : { type : Number, default : 0, required : true, trim : true },
        }]
    }],
    combos : [{
        id_combo : { type : mongoose.Schema.Types.ObjectId, required : true, trim : true },
        id_menu : { type : mongoose.Schema.Types.ObjectId, ref : 'Menus' ,required : true, trim : true },
        cantidad : { type : Number, required : true},
        subtotal : { type : Number, required : true, default : 0 },
        notas : { type : String, trim : true },
        ingredientes_extra : [{
            descripcion : { type : String, required : true, trim : true },
            costo : { type : Number, default : 0, required : true, trim : true },
        }]
    }],
});

const order = mongoose.model('Ordenes', orderModel);

module.exports = order;