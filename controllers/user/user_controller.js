const userModel = require('../../models/users/usuario');
const handle = require('../../utils/handle/handle_error');
const getDateAndTime = require('../../utils/date/date_info');

//Registrar nuevo usuario
const registerUser = async(req, res) => {
    try{
        const body = req.body;
        const { fecha, hora } = await getDateAndTime();

        const user = await userModel.findOne({nombre : body.nombre, usuario : body.usuario});
        if(user){
            return res.status(400).json({
                success : false,
                errorCode : 400,
                message : 'Este usuario ya existe'
            });
        }

        const newUser = new userModel({ 
            nombre : body.nombre,
            password : body.password,
            usuario : body.usuario, 
            direccion : body.direccion,
            ciudad : body.ciudad,
            colonia : body.colonia,
            telefono : body.telefono,
            puesto : body.puesto,
            horario : body.horario,
            salario : body.salario,
            turno : body.turno, 
            id_franquicia : body.id_franquicia,
            fecha_registro : fecha,
            hora_registro : hora,
        });
        await newUser.save();

        res.status(201).json({
            success : true,
            successCode : 201,
            message : 'Usuario guardado'
        });
    }catch(error){
        handle(res, error);
    }
}

//Buscar usuario por id
const searchUserByID = async(req, res) => {
    try{
        const userID = req.params.id;
        if(!userID){
            return res.status(400).json({
                success : true,
                errorCode : 400,
                message : 'ID invalido'
            }); 
        }

        const user = await userModel.findById(userID).select('-password');
        if(!user){
            return res.status(404).json({
                success : true,
                errorCode : 404,
                message : 'El usuario no existe'
            });
        }

        return res.status(201).json({
            success : true,
            successCode : 201,
            user : user
        });

    }catch(error){
        handle(res, error);
    }
}

//Obtener todos los usuarios
const allUsers = async(req, res) => {
    try{
        const users = await userModel.find().select('-password');

        if(!users || users.length == 0){
            return res.status(404).json({
                success : false,
                errorCode : 404,
                message : 'No hay usuarios registrados'
            });
        }

        return res.status(200).json({
            success : true,
            successCode : 200,
            users : users
        });

    }catch(error){
        handle(res, error);
    }
}

//Cambiar password
const changePassword = async(req, res) => {
    try{
        const userID = req.params.id;
        const { password } = req.body;

        if (!userID) {
            return res.status(400).json({
                success: false,
                errorCode: 400,
                message: 'ID inválido'
            });
        }

        const user = await userModel.findById(userID);
        if (!user) {
            return res.status(404).json({
                success: false,
                errorCode: 404,
                message: 'El usuario no existe'
            });
        }

        if (!password) {
            return res.status(400).json({
                success: false,
                errorCode: 400,
                message: 'La contraseña es requerida'
            });
        }

        user.password = password;
        await user.save();
        
        return res.status(200).json({
            success: true,
            successCode: 200,
            message: 'Contraseña actualizada'
        });
    }catch(error){
        handle(res, error);
    }
}

module.exports = {
    registerUser,
    allUsers,
    searchUserByID,
    changePassword
}