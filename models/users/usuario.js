const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const schema = mongoose.Schema;

const userModel = new schema({
    //Informacion del usuario
    nombre : { type : String, required : true, trim: true},
    usuario : { type : String, required : true, trim: true},
    password : { type : String, required : true, trim: true},
    fecha_registro : { type : String, required : true, trim: true},
    hora_registro : { type : String, required : true, trim: true},

    //Informacion del domicilio
    direccion : { type : String, required : true, trim: true},
    ciudad : { type : String, required : true, trim: true},
    colonia : { type : String, required : true, trim: true},
    telefono : { type : String, required : true, trim: true},

    //Informacion del puesto y sucursal
    puesto : { type : String, required : true, trim: true},
    horario : { type : String, required : true, trim: true},
    salario : { type : Number, required : true, trim: true},
    turno : { type : String, required : true, trim: true},
    id_franquicia : { type : schema.Types.ObjectId, ref : 'Franquicias', required : true},
});

userModel.pre('save', async function(next){
    try{
        const salt = 12;
        const hash = await bcrypt.hash(this.password, salt);
        this.password = hash;
        next();
    }catch(error){
        next(error);
    }
});

const user = mongoose.model('Empleados', userModel);

module.exports = user;