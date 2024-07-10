const menuModel = require('../../models/entities/menu');
const handle = require('../../utils/handle/handle_error');
const getDateAndTime = require('../../utils/date/date_info');
const { isValidObjectId } = require('mongoose');

//Registrar menu de una franquicia
const registerMenu = async(req, res) => {
    try{
        const { id_franquicia, productos, combos, estatus } = req.body;
        const { fecha, hora } = await getDateAndTime();

        const newMenu = new menuModel({
            id_franquicia,
            productos,
            combos,
            estatus,
            fecha_registro: fecha,
            hora_registro: hora,
        });
        await newMenu.save();

        res.status(201).json({
            success : true,
            successCode : 201,
            message : 'Menu guardado',
            newMenu
        });
    }catch(error){
        handle(res, error);
    }
}

//Todos los menus registrados en el sistema
const allMenus = async(req, res) => {
    try{
        const menus = await menuModel.find();
        if(!menus || menus.length == 0){
            return res.status(404).json({
                success : false,
                errorCode : 404,
                message : 'No hay menus registrados'
            });
        }

        return res.status(201).json({
            success : true,
            successCode : 201,
            menus
        });

    }catch(error){
        handle(res, error);
    }
}

//Menu de una franquicia
const franchiseMenu = async(req, res) => {
    try{
        const isValidId = isValidObjectId(req.params.id);
        const id = req.params.id;
        if(!isValidId){
            return res.status(400).json({
                success : false,
                errorCode : 400,
                message : 'Id requerido'
            });
        }

        const menu = await menuModel.find({id_franquicia : id});
        if(!menu || menu.length == 0){
            return res.status(404).json({
                success : false,
                errorCode : 404,
                message : 'No hay menus registrados'
            });
        }

        return res.status(201).json({
            success : true,
            successCode : 201,
            menu
        });

    }catch(error){
        handle(res, error);
    }
}

//Buscar menu por id
const seachMenuById = async(req, res) => {
    try{
        const isValidId = isValidObjectId(req.params.id);
        const id = req.params.id;
        if(!isValidId){
            return res.status(400).json({
                success : false,
                errorCode : 400,
                message : 'Id menu requerido'
            });
        }

        const menu = await menuModel.findById(id);
        if(!menu){
            return res.status(404).json({
                success : false,
                errorCode : 404,
                message : 'El menu no existe'
            });
        }

        return res.status(201).json({
            success : true,
            successCode : 201,
            menu : menu
        });

    }catch(error){
        handle(res, error);
    }
}

//Actulizar menu
const editMenu = async(req, res) => {
    try{
        const updateData = req.body;
        const isValidId = isValidObjectId(req.params.id);
        const id = req.params.id;
        if(!isValidId){
            return res.status(400).json({
                success : false,
                errorCode : 400,
                message : 'Id menu requerido'
            });
        }

        const menu = await menuModel.findById(id);
        if(!menu){
            return res.status(404).json({
                success : false,
                errorCode : 404,
                message : 'El menu no existe'
            });
        }

        const updateMenu = await menuModel.findByIdAndUpdate(id, updateData, { new : true });
        return res.status(201).json({
            success: true,
            successCode: 201,
            message: "Menu actualizado",
            data: updateMenu
        });
    }catch(error){
        handle(res, error);
    }
}

//Eliminar menu por id de una franquicia
const deleteMenu = async(req, res) => {
    try{
        const isValidId = isValidObjectId(req.params.id);
        const id = req.params.id;
        if(!isValidId){
            return res.status(400).json({
                success : false,
                errorCode : 400,
                message : 'Id menu requerido'
            });
        }

        const menu = await menuModel.findByIdAndDelete(id);
        if(!menu){
            return res.status(404).json({
                success : false,
                errorCode : 404,
                message : 'El menu no existe'
            });
        }

        return res.status(201).json({
            success : true,
            successCode : 201,
            message : 'Menu eliminado'
        });
    }catch(error){
        handle(res, error);
    }
}

module.exports = {
    registerMenu,
    allMenus,
    seachMenuById,
    franchiseMenu,
    editMenu,
    deleteMenu
}