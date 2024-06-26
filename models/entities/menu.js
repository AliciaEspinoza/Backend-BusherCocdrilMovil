const mongoose = require('mongoose');
const schema = mongoose.Schema;

const menuModel = new schema({
    id_franquicia : { type : schema.Types.ObjectId, ref : 'Franquicias', required : true},
    productos : [{
        nombre : { type : String, required : true, trim : true },
        pesaje : { type : String, required : true, trim : true },
        descripcion : { type : String, required : true, trim : true },
        costo : { type : Number, required : true, trim : true },
        estatus : { type : String, required : true, trim : true },
    }]
});

const menu = mongoose.model('Menus', menuModel);

module.exports = menu;