const userModel = require('../../models/users/usuario');
const franchiseModel = require('../../models/entities/franquicia');
const handle = require('../../utils/handle/handle_error');
const getDateAndTime = require('../../utils/date/date_info');
const { isValidObjectId } = require('mongoose');

//Registrar nuevo usuario
const registerUser = async(req, res) => {
    try{
        const body = req.body;
        const { fecha, hora } = await getDateAndTime();

        const user = await userModel.findOne({nombre : body.nombre, usuario : body.usuario});
        if(user){
            return res.status(400).json({
                success : false,
                httpCode : 400,
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
            httpCode : 201,
            message : 'Usuario guardado'
        });
    }catch(error){
        handle(res, error);
    }
}

//Buscar usuario por nombre, usuario o telefono
const searchUser = async(req, res) => {
    try{
        const searchValue = req.body.value;

        let searchConditions = {};
        searchConditions['$or'] = [
            {'nombre': {$regex: searchValue, $options: 'i'}},
            {'usuario': {$regex: searchValue, $options: 'i'}},
            {'telefono': {$regex: searchValue, $options: 'i'}},
        ];

        const user = await userModel.find(searchConditions).select('-password');
        if(!user || user.length == 0){
            return res.status(404).json({
                success : true,
                httpCode : 404,
                message : 'No se han encontrado usuarios'
            });
        }

        return res.status(201).json({
            success : true,
            httpCode : 201,
            user : user
        });

    }catch(error){
        handle(res, error);
    }
}

//Buscar usuario por id
const searchUserByID = async(req, res) => {
    try{
        const isValidId = isValidObjectId(req.params.id);
        const id = req.params.id;
        if(!isValidId){
            return res.status(400).json({
                success : true,
                httpCode : 400,
                message : 'ID invalido'
            }); 
        }

        const user = await userModel.findById(id).select('-password');
        if(!user){
            return res.status(404).json({
                success : true,
                httpCode : 404,
                message : 'El usuario no existe'
            });
        }

        return res.status(201).json({
            success : true,
            httpCode : 201,
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
                httpCode : 404,
                message : 'No hay usuarios registrados'
            });
        }

        return res.status(200).json({
            success : true,
            httpCode : 200,
            users : users
        });

    }catch(error){
        handle(res, error);
    }
}

//Cambiar password
const changePassword = async(req, res) => {
    try{
        const { password } = req.body;
        const isValidId = isValidObjectId(req.params.id);
        const id = req.params.id;
        if(!isValidId){
            return res.status(400).json({
                success: false,
                httpCode: 400,
                message: 'Id requerido'
            });
        }

        const user = await userModel.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                httpCode: 404,
                message: 'El usuario no existe'
            });
        }

        if (!password) {
            return res.status(400).json({
                success: false,
                httpCode: 400,
                message: 'La contraseña es requerida'
            });
        }

        user.password = password;
        await user.save();
        
        return res.status(200).json({
            success: true,
            httpCode: 200,
            message: 'Contraseña actualizada'
        });
    }catch(error){
        handle(res, error);
    }
}

//Cambiar usuario de franquicia
const editUserFranchise = async(req, res) => {
    try{
        const isValidUserId = isValidObjectId(req.body.id);
        const isValidFranchiseId = isValidObjectId(req.body.id_franquicia);
        if(!isValidUserId || !isValidFranchiseId){
            return res.status(400).json({
                success : false,
                httpCode : 400,
                message : 'Id usuario y/o franquicia invalido(s)'
            });
        }

        const newFranchise = req.body.id_franquicia;
        const idUser = req.body.id;
        const existFranchise = await franchiseModel.findById(newFranchise);
        const existUser = await userModel.findById(idUser);

        if(!existUser || !existFranchise){
            return res.status(400).json({
                success : false,
                httpCode : 400,
                message : 'El usuario y/o franquicia no existe(n)'
            });
        }

        await userModel.findByIdAndUpdate(idUser, { id_franquicia : newFranchise }, { new : true });

        return res.status(201).json({
            success : true,
            httpCode : 201,
            message : 'Usuario actualizado'
        });
    }catch(error){
        handle(res, error);
    }
};

//Editar usuario
const editUser = async(req, res) => {
    try{
        const updateData = req.body;
        const isValidId = isValidObjectId(req.params.id);
        const id = req.params.id;
        if(!isValidId){
            return res.status(400).json({
                success: false,
                httpCode: 400,
                message: 'Id requerido'
            });
        }

        const user = await userModel.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                httpCode: 404,
                message: 'El usuario no existe'
            });
        }

        const updatedUser = await userModel.findByIdAndUpdate(id, updateData, { new: true })
        return res.status(201).json({
            success: true,
            httpCode: 201,
            message: "Datos actualizados",
            data: updatedUser
        });
    }catch(error){
        handle(res, error);
    }
};

//Eliminar usuario
const deleteUser = async(req, res) => {
    try{
        const isValidId = isValidObjectId(req.params.id);
        const id = req.params.id;
        if(!isValidId){
            return res.status(400).json({
                success: false,
                httpCode: 400,
                message: 'Id requerido'
            });
        }

        const user = await userModel.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                httpCode: 404,
                message: 'El usuario no existe'
            });
        }

        await userModel.findByIdAndDelete(id);
        return res.status(201).json({
            success : true,
            httpCode : 201,
            message : 'Usuario eliminado'
        });
    }catch(error){
        handle(res, error);
    }
};

module.exports = {
    registerUser,
    allUsers,
    searchUserByID,
    searchUser,
    changePassword,
    editUser,
    editUserFranchise,
    deleteUser
}