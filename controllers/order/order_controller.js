const orderModel = require('../../models/entities/order');
const menuModel = require('../../models/entities/menu');
const handle = require('../../utils/handle/handle_error');
const getDateAndTime = require('../../utils/date/date_info');
const { isValidObjectId } = require('mongoose');
const Decimal = require('decimal.js');

//Registrar orden
const registerOrder = async(req, res) => {
    try{
        const { id_franquicia, folio, nombre, productos, combos, estatus, mesa, mesero } = req.body;
        const { fecha, hora } = await getDateAndTime();

        const newOrder = new orderModel({
            id_franquicia,
            folio,
            nombre,
            productos,
            combos,
            estatus,
            mesa,
            mesero,
            fecha_registro: fecha,
            hora_registro: hora,
        });

        let productsList = [];
        let combosList = [];
        let total = new Decimal(0);

        // Obtener información de los productos consultados por id
        for (const product of productos) {
            const menu = await menuModel.findById(product.id_menu);
            if (!menu) {
                return res.status(404).json({
                    success: false,
                    message: `Id del menu no encontrado`,
                });
            }
            const productDetails = menu.productos.id(product.id_producto);
            if (productDetails) {
                productsList.push({ 
                    ...productDetails.toObject(), 
                    cantidad: product.cantidad, 
                    ingredientes_extra: product.ingredientes_extra 
                });
            }
        }

        // Obtener información de los combos por id
        for (const combo of combos) {
            const menu = await menuModel.findById(combo.id_menu);
            if (!menu) {
                return res.status(404).json({
                    success: false,
                    message: `Id del menu no encontrado`,
                });
            }
            const comboDetails = menu.combos.id(combo.id_combo);
            if (comboDetails) {
                combosList.push({ ...comboDetails.toObject(), cantidad: combo.cantidad, ingredientes_extra: combo.ingredientes_extra });
            }
        }

        // Calcular el subtotal de productos
        productsList.forEach(product => {
            let itemSubtotal = new Decimal(product.costo).times(product.cantidad);
            // Sumar el costo de los ingredientes extra
            product.ingredientes_extra.forEach(extra => {
                itemSubtotal = itemSubtotal.plus(new Decimal(extra.costo).times(product.cantidad));
            });
            total = total.plus(itemSubtotal);
        });

        // Calcular el subtotal de combos
        combosList.forEach(combo => {
            let itemSubtotal = new Decimal(combo.costo).times(combo.cantidad);
            // Sumar el costo de los ingredientes extra
            combo.ingredientes_extra.forEach(extra => {
                itemSubtotal = itemSubtotal.plus(new Decimal(extra.costo).times(combo.cantidad));
            });
            total = total.plus(itemSubtotal);
        });

        // Calcula el IVA y el total
        const iva = total.times(0.16).toFixed(2);
        const subtotal = total.minus(new Decimal(iva)).toFixed(2);

        newOrder.subtotal = parseFloat(subtotal);
        newOrder.iva = parseFloat(iva);
        newOrder.total = parseFloat(total);

        await newOrder.save();

        return res.status(201).json({
            success: true,
            successCode: 201,
            message: 'Orden registrada',
            order: newOrder,
        });
    }catch(error){
        handle(res, error);
    }
};

//Buscar orden por id
const searchOrder = async(req, res) => {
    try{
        const isValidId = isValidObjectId(req.params.id);
        const id = req.params.id;
        if(!isValidId){
            return res.status(400).json({
                success : false,
                errorCode : 400,
                message : 'Id orden requerido' 
            });
        }

        const order = await orderModel.findById(id);
        if(!order){
            return res.status(404).json({
                success : false,
                errorCode : 404,
                message : 'La orden no existe' 
            });
        }

        let productsList = [];
        let combosList = [];

        // Obtener información de los productos consultados por id, agregar cantidad e ingredientes extra
        for (const product of order.productos) {
            const menu = await menuModel.findById(product.id_menu);
            if (!menu) {
                return res.status(404).json({
                    success: false,
                    message: `Id del menu no encontrado`,
                });
            }
            const productDetails = menu.productos.id(product.id_producto);
            if (productDetails) {
                productsList.push({ 
                    ...productDetails.toObject(), 
                    cantidad: product.cantidad, 
                    ingredientes_extra: product.ingredientes_extra 
                });
            }
        }

        // Obtener información de los combos por id, agregar cantidad e ingredientes extra
        for (const combo of order.combos) {
            const menu = await menuModel.findById(combo.id_menu);
            if (!menu) {
                return res.status(404).json({
                    success: false,
                    message: `Id del menu no encontrado`,
                });
            }
            const comboDetails = menu.combos.id(combo.id_combo);
            if (comboDetails) {
                combosList.push({ ...comboDetails.toObject(), cantidad: combo.cantidad, ingredientes_extra: combo.ingredientes_extra });
            }
        }

        // Excluir combos y productos
        const { productos, combos, ...orderData } = order.toObject();

        // Agregar informacion completa a la orden
        orderData.productos = productsList;
        orderData.combos = combosList;

        res.status(201).json({
            success : true,
            successCode : 201,
            order : orderData,
        });
    }catch(error){
        handle(res, error);
    }
}

//Consultar todas las ordenes de una franquicia
const allOrdersByFranchise = async(req, res) => {
    try{
        const isValidId = isValidObjectId(req.params.id);
        const id = req.params.id;
        if(!isValidId){
            return res.status(400).json({
                success : false,
                errorCode : 400,
                message : 'Id franquicia requerido'
            });
        }

        const orders = await orderModel.find({ id_franquicia : id });
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
        const isValidId = isValidObjectId(req.params.id);
        const id = req.params.id;
        if(!isValidId){
            return res.status(400).json({
                success : false,
                errorCode : 400,
                message : 'Id franquicia requerido'
            });
        }

        const orders = await orderModel.find({id_franquicia : id, estatus : 'pendiente'});
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
        const isValidId = isValidObjectId(req.params.id);
        const id = req.params.id;
        if(!isValidId){
            return res.status(400).json({
                success : false,
                errorCode : 400,
                message : 'Id franquicia requerido'
            });
        }

        const orders = await orderModel.find({id_franquicia : id, estatus : 'completada'});
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
        const isValidId = isValidObjectId(req.params.id);
        const id = req.params.id;
        if(!isValidId){
            return res.status(400).json({
                success : false,
                errorCode : 400,
                message : 'Id orden requerido'
            });
        }

        const order = await orderModel.findById(id);
        if(!order){
            return res.status(400).json({
                success : false,
                errorCode : 400,
                message : 'Id orden requerido'
            });
        }

        await orderModel.findByIdAndUpdate(id, { estatus : 'completada' }, { new : true });
        return res.status(201).json({
            success : true,
            successCode : 201,
            message : 'Orden actualizada',
        });

    }catch(error){
        handle(res, error);
    }
};  

//Eliminar orden por id
const deleteOrder = async(req, res) => {
    try{
        const isValidId = isValidObjectId(req.params.id);
        const id = req.params.id;
        if(!isValidId){
            return res.status(400).json({
                success : false,
                errorCode : 400,
                message : 'Id orden requerido' 
            });
        }

        const order = await orderModel.findById(id);
        if(!order){
            return res.status(404).json({
                success : false,
                errorCode : 404,
                message : 'La orden no existe' 
            });
        }

        return res.status(201).json({
            success : true,
            successCode : 201,
            message : 'Orden eliminada' 
        });
    }catch(error){
        handle(res, error);
    }
}

//Eliminar todas las ordendes de una franquicia
const deleteAllOrdersByFranchise = async(req, res) => {
    try{
        const isValidId = isValidObjectId(req.params.id);
        const id = req.params.id;
        if(!isValidId){
            return res.status(400).json({
                success : false,
                errorCode : 400,
                message : 'Id franquicia requerido'
            });
        }

        await orderModel.deleteMany({ id_franquicia : id });

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
    searchOrder,
    allOrdersByFranchise,
    backOrders,
    completedOrders,
    changeOrderStatus,
    deleteAllOrdersByFranchise,
    deleteOrder,
    deleteAllOrders
}