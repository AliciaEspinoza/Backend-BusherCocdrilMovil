const menuModel = require('../../models/entities/menu');
const handle = require('../../utils/handle/handle_error');
const getDateAndTime = require('../../utils/date/date_info');

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
        const id = req.params.id;
        if(!id){
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

//Agregar productos a un menu de una franquicia

//Agregar combos a un menu de una franquicia

//Eliminar menu de una franquicia

module.exports = {
    registerMenu,
    allMenus,
    franchiseMenu
}