const orderModel = require('../../models/entities/order');
const handle = require('../../utils/handle/handle_error');
const getDateAndTime = require('../../utils/date/date_info');
const { isValidObjectId } = require('mongoose');

//Registrar orden
const registerOrder = async(req, res) => {
    try{
        const {  id_franquicia ,folio, nombre, productos, combos, estatus } = req.body;
        const { fecha, hora } = await getDateAndTime();

        const newOrder = new orderModel({
            id_franquicia,
            folio,
            nombre,
            productos,
            combos,
            estatus,
            fecha_registro: fecha,
            hora_registro: hora,
        });

        await newOrder.save();

        return res.status(201).json({
            success : true,
            successCode : 201,
            message : 'Orden registrada',
            newOrder
        });

    }catch(error){
        handle(res, error);
    }
};

//Consultar todas las ordenes de una franquicia
const allOrdersByFranchise = async(req, res) => {
    try{
        const id_franquicia = isValidObjectId(req.params.id);
        if(!id_franquicia){
            return res.status(400).json({
                success : false,
                errorCode : 400,
                message : 'Id franquicia requerido'
            });
        }

        const orders = await orderModel.find({ id_franquicia : id_franquicia });
        return res.status(201).json({
            success : true,
            successCode : 201,
            orders
        });
    }catch(error){
        handle(res, error);
    }
}

//Ordenes pendientes
const backOrders = async(req, res) => {
    try{
        const id_franquicia = isValidObjectId(req.params.id);
        if(!id_franquicia){
            return res.status(400).json({
                success : false,
                errorCode : 400,
                message : 'Id franquicia requerido'
            });
        }

        const orders = await orderModel.find({id_franquicia : id_franquicia, estatus : 'pendiente'});
        if(!orders || orders.length == 0){
            return res.status(404).json({
                success : false,
                errorCode : 404,
                message : 'No hay ordenes pendientes'
            });
        }

        return res.status(201).json({
            success : true,
            successCode : 201,
            count : orders.length,
            orders
        });

    }catch(error){
        handle(res, error);
    }
};

//Ordenes completadas
const completedOrders = async(req, res) => {
    try{
        const id_franquicia = isValidObjectId(req.params.id);
        if(!id_franquicia){
            return res.status(400).json({
                success : false,
                errorCode : 400,
                message : 'Id franquicia requerido'
            });
        }

        const orders = await orderModel.find({id_franquicia : id_franquicia, estatus : 'completada'});
        if(!orders || orders.length == 0){
            return res.status(404).json({
                success : false,
                errorCode : 404,
                message : 'No hay ordenes completadas'
            });
        }

        return res.status(201).json({
            success : true,
            successCode : 201,
            count : orders.length,
            orders
        });

    }catch(error){
        handle(res, error);
    }
};

//Marcar como terminada una orden
const changeOrderStatus = async(req, res) => {
    try{
        const id_order = isValidObjectId(req.params.id);
        const order = await orderModel.findById(id_order);
        if(!order){
            return res.status(400).json({
                success : false,
                errorCode : 400,
                message : 'Id orden requerido'
            });
        }

        await orderModel.findByIdAndUpdate(id_order, { estatus : 'completada' }, { new : true });
        return res.status(201).json({
            success : true,
            successCode : 201,
            message : 'Orden actualizada',
        });

    }catch(error){
        handle(res, error);
    }
};  

//Eliminar todas las ordendes de una franquicia
const deleteAllOrdersByFranchise = async(req, res) => {
    try{
        const id_franquicia = isValidObjectId(req.params.id);
        if(!id_franquicia){
            return res.status(400).json({
                success : false,
                errorCode : 400,
                message : 'Id franquicia requerido'
            });
        }

        await orderModel.deleteMany({ id_franquicia : id_franquicia });

        return res.status(201).json({
            success : true,
            successCode : 201,
            message : 'Ordenes eliminadas'
        });
    }catch(error){
        handle(res, error);
    }
};

//Eliminar coleccion de ordenes
const deleteAllOrders = async(req, res) => {
    try{
        await orderModel.deleteMany({});

        return res.status(201).json({
            success : true,
            successCode : 201,
            message : 'Todas las ordenes han sido eliminadas'
        });
    }catch(error){
        handle(res, error);
    }
};

module.exports = {
    registerOrder,
    allOrdersByFranchise,
    backOrders,
    completedOrders,
    changeOrderStatus,
    deleteAllOrdersByFranchise,
    deleteAllOrders
}