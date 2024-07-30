const orderModel = require('../../models/entities/order');
const menuModel = require('../../models/entities/menu');
const handle = require('../../utils/handle/handle_error');
const getDateAndTime = require('../../utils/date/date_info');
const { isValidObjectId } = require('mongoose');
const Decimal = require('decimal.js');

//Registrar orden
const registerOrder = async (req, res) => {
    try {
        const { id_franquicia, folio, nombre_cliente, tipo_orden, estatus, mesa, mesero } = req.body;
        const prod = req.body.productos;
        const comb = req.body.combos; 
        const { fecha, hora } = await getDateAndTime();

        let total = new Decimal(0);

        const updatedProductos = await Promise.all(prod.map(async (product) => {
            const menu = await menuModel.findById(product.id_menu);
            if (!menu) {
                return res.status(404).json({
                    success: false,
                    message: `Id del menu no encontrado`,
                });
            }
            const productDetails = menu.productos.id(product.id_producto);
            if (productDetails) {
                let subtotal = new Decimal(productDetails.costo).times(product.cantidad);

                // Agregar costo de ingredientes extra
                if (product.ingredientes_extra && product.ingredientes_extra.length > 0) {
                    for (const extra of product.ingredientes_extra) {
                        const extraCost = new Decimal(extra.costo).times(product.cantidad);
                        subtotal = subtotal.plus(extraCost);
                    }
                }

                total = total.plus(subtotal);

                return {
                    ...product,
                    nombre: productDetails.nombre,
                    pesaje: productDetails.pesaje,
                    categoria: productDetails.categoria,
                    descripcion: productDetails.descripcion,
                    costo: productDetails.costo,
                    estatus: productDetails.estatus,
                    subtotal: subtotal.toFixed(2),
                };
            }
        }));

        // Calcular subtotales de combos
        const updatedCombos = await Promise.all(comb.map(async (combo) => {
            const menu = await menuModel.findById(combo.id_menu);
            if (!menu) {
                return res.status(404).json({
                    success: false,
                    message: `Id del menu no encontrado`,
                });
            }
            const comboDetails = menu.combos.id(combo.id_combo);
            if (comboDetails) {
                let subtotal = new Decimal(comboDetails.costo).times(combo.cantidad);

                // Agregar costo de ingredientes extra
                if (combo.ingredientes_extra && combo.ingredientes_extra.length > 0) {
                    for (const extra of combo.ingredientes_extra) {
                        const extraCost = new Decimal(extra.costo).times(combo.cantidad);
                        subtotal = subtotal.plus(extraCost);
                    }
                }

                total = total.plus(subtotal);

                return {
                    ...combo,
                    nombre: comboDetails.nombre,
                    descripcion: comboDetails.descripcion,
                    costo: comboDetails.costo,
                    estatus: comboDetails.estatus,
                    subtotal: subtotal.toFixed(2),
                };
            }
        }));

        // Calcular IVA y total
        const iva = total.times(0.16).toFixed(2);
        const subtotal = total.minus(new Decimal(iva)).toFixed(2);

        const newOrder = new orderModel({
            id_franquicia,
            folio,
            nombre_cliente,
            tipo_orden,
            productos: updatedProductos,
            combos: updatedCombos,
            estatus,
            mesa,
            mesero,
            fecha_registro: fecha,
            hora_registro: hora,
            subtotal: parseFloat(subtotal),
            iva: parseFloat(iva),
            total: parseFloat(total),
        });

        await newOrder.save();

        // Obtener información de los productos y combos para la respuesta
        let productsList = [];
        let combosList = [];

        for (const product of newOrder.productos) {
            const menu = await menuModel.findById(product.id_menu);
            const productDetails = menu.productos.id(product.id_producto);
            if (productDetails) {
                let subtotal = new Decimal(productDetails.costo).times(product.cantidad);
                if (product.ingredientes_extra && product.ingredientes_extra.length > 0) {
                    for (const extra of product.ingredientes_extra) {
                        const extraCost = new Decimal(extra.costo).times(product.cantidad);
                        subtotal = subtotal.plus(extraCost);
                    }
                }
                product.subtotal = subtotal.toFixed(2);
                productsList.push({
                    ...productDetails.toObject(),
                    cantidad: product.cantidad,
                    ingredientes_extra: product.ingredientes_extra,
                    subtotal: subtotal.toFixed(2)
                });
            }
        }

        for (const combo of newOrder.combos) {
            const menu = await menuModel.findById(combo.id_menu);
            const comboDetails = menu.combos.id(combo.id_combo);
            if (comboDetails) {
                let subtotal = new Decimal(comboDetails.costo).times(combo.cantidad);
                if (combo.ingredientes_extra && combo.ingredientes_extra.length > 0) {
                    for (const extra of combo.ingredientes_extra) {
                        const extraCost = new Decimal(extra.costo).times(combo.cantidad);
                        subtotal = subtotal.plus(extraCost);
                    }
                }
                combo.subtotal = subtotal.toFixed(2);
                combosList.push({
                    ...comboDetails.toObject(),
                    cantidad: combo.cantidad,
                    ingredientes_extra: combo.ingredientes_extra,
                    subtotal: subtotal.toFixed(2)
                });
            }
        }

        // Excluir combos y productos originales
        const { productos, combos, ...orderData } = newOrder.toObject();
        orderData.productos = productsList;
        orderData.combos = combosList;

        return res.status(201).json({
            success: true,
            httpCode: 201,
            message: 'Orden registrada',
            order: orderData,
        });
    } catch (error) {
        handle(res, error);
    }
};

//Buscar orden por id
const searchOrder = async (req, res) => {
    try {
        const id = req.params.id;
        const isValidId = isValidObjectId(id);
        if (!isValidId) {
            return res.status(400).json({
                success: false,
                httpCode: 400,
                message: 'Id orden requerido'
            });
        }

        const order = await orderModel.findById(id);
        if (!order) {
            return res.status(404).json({
                success: false,
                httpCode: 404,
                message: 'La orden no existe'
            });
        }

        let productsList = [];
        let combosList = [];

        // Obtener información de los productos consultados por id y calcular el subtotal
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
                let subtotal = new Decimal(productDetails.costo).times(product.cantidad);

                // Agregar costo de ingredientes extra
                if (product.ingredientes_extra && product.ingredientes_extra.length > 0) {
                    for (const extra of product.ingredientes_extra) {
                        const extraCost = new Decimal(extra.costo).times(product.cantidad);
                        subtotal = subtotal.plus(extraCost);
                    }
                }

                product.subtotal = subtotal.toFixed(2);
                await order.save();

                productsList.push({
                    ...productDetails.toObject(),
                    cantidad: product.cantidad,
                    ingredientes_extra: product.ingredientes_extra,
                    subtotal: subtotal.toFixed(2) // Agregar el subtotal calculado
                });
            }
        }

        // Obtener información de los combos por id y calcular el subtotal
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
                let subtotal = new Decimal(comboDetails.costo).times(combo.cantidad);

                // Agregar costo de ingredientes extra
                if (combo.ingredientes_extra && combo.ingredientes_extra.length > 0) {
                    for (const extra of combo.ingredientes_extra) {
                        const extraCost = new Decimal(extra.costo).times(combo.cantidad);
                        subtotal = subtotal.plus(extraCost);
                    }
                }

                combo.subtotal = subtotal.toFixed(2);
                await order.save();

                combosList.push({
                    ...comboDetails.toObject(),
                    cantidad: combo.cantidad,
                    ingredientes_extra: combo.ingredientes_extra,
                    subtotal: subtotal.toFixed(2) // Agregar el subtotal calculado
                });
            }
        }

        // Excluir combos y productos originales
        const { productos, combos, ...orderData } = order.toObject();
        orderData.productos = productsList;
        orderData.combos = combosList;

        res.status(200).json({
            success: true,
            httpCode: 200,
            order: orderData,
        });
    } catch (error) {
        handle(res, error);
    }
};

//Consultar todas las ordenes de una franquicia
const allOrdersByFranchise = async(req, res) => {
    try{
        const isValidId = isValidObjectId(req.params.franchise);
        const id = req.params.franchise;
        if(!isValidId){
            return res.status(400).json({
                success : false,
                httpCode : 400,
                message : 'Id franquicia requerido'
            });
        }

        const orders = await orderModel.find({ id_franquicia : id });
        return res.status(201).json({
            success : true,
            httpCode : 201,
            orders
        });
    }catch(error){
        handle(res, error);
    }
}

//Buscar ordenes de una mesa por franquicia
const ordersByTable = async(req, res) => {
    try{
        const isValidId = isValidObjectId(req.params.franchise);
        const tableNumber = parseInt(req.params.table);
        const id = req.params.franchise;
        if(!isValidId){
            return res.status(400).json({
                success : false,
                httpCode : 400,
                message : 'Id franquicia requerido'
            });
        }

        if(!tableNumber || tableNumber < 0 || tableNumber > 20){
            return res.status(400).json({
                success : false,
                httpCode : 400,
                message : 'Numero de mesa invalido/requerido'
            });
        }

        const orders = await orderModel.find({
            id_franquicia : id,
            mesa : tableNumber,
        });
        
        if(!orders || orders.length < 1){
            return res.status(404).json({
                success : false,
                httpCode : 404,
                message : `La mesa ${tableNumber} no tiene ordenes`
            });
        }

         // Obtener detalles de productos y combos para cada orden
         const detailedOrders = await Promise.all(orders.map(async (order) => {
            const productsList = await Promise.all(order.productos.map(async (product) => {
                const menu = await menuModel.findById(product.id_menu);
                if (menu) {
                    const productDetails = menu.productos.id(product.id_producto);
                    if (productDetails) {
                        let subtotal = new Decimal(productDetails.costo).times(product.cantidad);

                        // Agregar costo de ingredientes extra
                        if (product.ingredientes_extra && product.ingredientes_extra.length > 0) {
                            for (const extra of product.ingredientes_extra) {
                                const extraCost = new Decimal(extra.costo).times(product.cantidad);
                                subtotal = subtotal.plus(extraCost);
                            }
                        }

                        return {
                            ...productDetails.toObject(),
                            cantidad: product.cantidad,
                            ingredientes_extra: product.ingredientes_extra,
                            subtotal: subtotal.toFixed(2)
                        };
                    }
                }
                return null;
            }));

            const combosList = await Promise.all(order.combos.map(async (combo) => {
                const menu = await menuModel.findById(combo.id_menu);
                if (menu) {
                    const comboDetails = menu.combos.id(combo.id_combo);
                    if (comboDetails) {
                        let subtotal = new Decimal(comboDetails.costo).times(combo.cantidad);

                        // Agregar costo de ingredientes extra
                        if (combo.ingredientes_extra && combo.ingredientes_extra.length > 0) {
                            for (const extra of combo.ingredientes_extra) {
                                const extraCost = new Decimal(extra.costo).times(combo.cantidad);
                                subtotal = subtotal.plus(extraCost);
                            }
                        }

                        return {
                            ...comboDetails.toObject(),
                            cantidad: combo.cantidad,
                            ingredientes_extra: combo.ingredientes_extra,
                            subtotal: subtotal.toFixed(2)
                        };
                    }
                }
                return null;
            }));

            return {
                ...order.toObject(),
                productos: productsList.filter(p => p !== null),
                combos: combosList.filter(c => c !== null)
            };
        }));

        return res.status(200).json({
            success: true,
            httpCode: 200,
            orders: detailedOrders,
            total: detailedOrders.length
        });
    }catch(error){
        handle(res, error);
    }
};

//Ordenes completadas de una mesa por franquicia
const completedOrdersByTable = async(req, res) => {
    try{
        const isValidId = isValidObjectId(req.params.franchise);
        const tableNumber = parseInt(req.params.table);
        const id = req.params.franchise;
        if(!isValidId){
            return res.status(400).json({
                success : false,
                httpCode : 400,
                message : 'Id franquicia requerido'
            });
        }

        if(!tableNumber || tableNumber < 0 || tableNumber > 20){
            return res.status(400).json({
                success : false,
                httpCode : 400,
                message : 'Numero de mesa invalido/requerido'
            });
        }

        const orders = await orderModel.find({
            id_franquicia : id,
            mesa : tableNumber,
            estatus : 'completada',
            tipo_orden : 'restaurante'
        });
        
        if(!orders || orders.length < 1){
            return res.status(404).json({
                success : false,
                httpCode : 404,
                message : `La mesa ${tableNumber} no tiene ordenes completadas`
            });
        }

         // Obtener detalles de productos y combos para cada orden
         const detailedOrders = await Promise.all(orders.map(async (order) => {
            const productsList = await Promise.all(order.productos.map(async (product) => {
                const menu = await menuModel.findById(product.id_menu);
                if (menu) {
                    const productDetails = menu.productos.id(product.id_producto);
                    if (productDetails) {
                        let subtotal = new Decimal(productDetails.costo).times(product.cantidad);

                        // Agregar costo de ingredientes extra
                        if (product.ingredientes_extra && product.ingredientes_extra.length > 0) {
                            for (const extra of product.ingredientes_extra) {
                                const extraCost = new Decimal(extra.costo).times(product.cantidad);
                                subtotal = subtotal.plus(extraCost);
                            }
                        }

                        return {
                            ...productDetails.toObject(),
                            cantidad: product.cantidad,
                            ingredientes_extra: product.ingredientes_extra,
                            subtotal: subtotal.toFixed(2)
                        };
                    }
                }
                return null;
            }));

            const combosList = await Promise.all(order.combos.map(async (combo) => {
                const menu = await menuModel.findById(combo.id_menu);
                if (menu) {
                    const comboDetails = menu.combos.id(combo.id_combo);
                    if (comboDetails) {
                        let subtotal = new Decimal(comboDetails.costo).times(combo.cantidad);

                        // Agregar costo de ingredientes extra
                        if (combo.ingredientes_extra && combo.ingredientes_extra.length > 0) {
                            for (const extra of combo.ingredientes_extra) {
                                const extraCost = new Decimal(extra.costo).times(combo.cantidad);
                                subtotal = subtotal.plus(extraCost);
                            }
                        }

                        return {
                            ...comboDetails.toObject(),
                            cantidad: combo.cantidad,
                            ingredientes_extra: combo.ingredientes_extra,
                            subtotal: subtotal.toFixed(2)
                        };
                    }
                }
                return null;
            }));

            return {
                ...order.toObject(),
                productos: productsList.filter(p => p !== null),
                combos: combosList.filter(c => c !== null)
            };
        }));

        return res.status(200).json({
            success: true,
            httpCode: 200,
            orders: detailedOrders,
            total: detailedOrders.length
        });
    }catch(error){
        handle(res, error);
    }
};

//Ordenes pendientes de una mesa por franquicia
const backOrdersByTable = async(req, res) => {
    try{
        const isValidId = isValidObjectId(req.params.franchise);
        const tableNumber = parseInt(req.params.table);
        const id = req.params.franchise;
        if(!isValidId){
            return res.status(400).json({
                success : false,
                httpCode : 400,
                message : 'Id franquicia requerido'
            });
        }

        if(!tableNumber || tableNumber < 0 || tableNumber > 20){
            return res.status(400).json({
                success : false,
                httpCode : 400,
                message : 'Numero de mesa invalido/requerido'
            });
        }

        const orders = await orderModel.find({
            id_franquicia : id,
            mesa : tableNumber,
            estatus : 'pendiente',
            tipo_orden : 'restaurante'
        });
        
        if(!orders || orders.length < 1){
            return res.status(404).json({
                success : false,
                httpCode : 404,
                message : `La mesa ${tableNumber} no tiene ordenes pendientes`
            });
        }

         // Obtener detalles de productos y combos para cada orden
         const detailedOrders = await Promise.all(orders.map(async (order) => {
            const productsList = await Promise.all(order.productos.map(async (product) => {
                const menu = await menuModel.findById(product.id_menu);
                if (menu) {
                    const productDetails = menu.productos.id(product.id_producto);
                    if (productDetails) {
                        let subtotal = new Decimal(productDetails.costo).times(product.cantidad);

                        // Agregar costo de ingredientes extra
                        if (product.ingredientes_extra && product.ingredientes_extra.length > 0) {
                            for (const extra of product.ingredientes_extra) {
                                const extraCost = new Decimal(extra.costo).times(product.cantidad);
                                subtotal = subtotal.plus(extraCost);
                            }
                        }

                        return {
                            ...productDetails.toObject(),
                            cantidad: product.cantidad,
                            ingredientes_extra: product.ingredientes_extra,
                            subtotal: subtotal.toFixed(2)
                        };
                    }
                }
                return null;
            }));

            const combosList = await Promise.all(order.combos.map(async (combo) => {
                const menu = await menuModel.findById(combo.id_menu);
                if (menu) {
                    const comboDetails = menu.combos.id(combo.id_combo);
                    if (comboDetails) {
                        let subtotal = new Decimal(comboDetails.costo).times(combo.cantidad);

                        // Agregar costo de ingredientes extra
                        if (combo.ingredientes_extra && combo.ingredientes_extra.length > 0) {
                            for (const extra of combo.ingredientes_extra) {
                                const extraCost = new Decimal(extra.costo).times(combo.cantidad);
                                subtotal = subtotal.plus(extraCost);
                            }
                        }

                        return {
                            ...comboDetails.toObject(),
                            cantidad: combo.cantidad,
                            ingredientes_extra: combo.ingredientes_extra,
                            subtotal: subtotal.toFixed(2)
                        };
                    }
                }
                return null;
            }));

            return {
                ...order.toObject(),
                productos: productsList.filter(p => p !== null),
                combos: combosList.filter(c => c !== null)
            };
        }));

        return res.status(200).json({
            success: true,
            httpCode: 200,
            orders: detailedOrders,
            total: detailedOrders.length
        });
    }catch(error){
        handle(res, error);
    }
};

//Ordenes completadas a domilicio por franquicia
const completedOrdersAtHome = async(req, res) => {
    try{
        const isValidId = isValidObjectId(req.params.franchise);
        const id = req.params.franchise;
        if(!isValidId){
            return res.status(400).json({
                success : false,
                httpCode : 400,
                message : 'Id franquicia requerido'
            });
        }

        const orders = await orderModel.find({
            id_franquicia : id,
            estatus : 'completada',
            tipo_orden : 'domicilio'
        });
        
        if(!orders || orders.length < 1){
            return res.status(404).json({
                success : false,
                httpCode : 404,
                message : `No hay ordenes completadas a domicilio`
            });
        }

         // Obtener detalles de productos y combos para cada orden
         const detailedOrders = await Promise.all(orders.map(async (order) => {
            const productsList = await Promise.all(order.productos.map(async (product) => {
                const menu = await menuModel.findById(product.id_menu);
                if (menu) {
                    const productDetails = menu.productos.id(product.id_producto);
                    if (productDetails) {
                        let subtotal = new Decimal(productDetails.costo).times(product.cantidad);

                        // Agregar costo de ingredientes extra
                        if (product.ingredientes_extra && product.ingredientes_extra.length > 0) {
                            for (const extra of product.ingredientes_extra) {
                                const extraCost = new Decimal(extra.costo).times(product.cantidad);
                                subtotal = subtotal.plus(extraCost);
                            }
                        }

                        return {
                            ...productDetails.toObject(),
                            cantidad: product.cantidad,
                            ingredientes_extra: product.ingredientes_extra,
                            subtotal: subtotal.toFixed(2)
                        };
                    }
                }
                return null;
            }));

            const combosList = await Promise.all(order.combos.map(async (combo) => {
                const menu = await menuModel.findById(combo.id_menu);
                if (menu) {
                    const comboDetails = menu.combos.id(combo.id_combo);
                    if (comboDetails) {
                        let subtotal = new Decimal(comboDetails.costo).times(combo.cantidad);

                        // Agregar costo de ingredientes extra
                        if (combo.ingredientes_extra && combo.ingredientes_extra.length > 0) {
                            for (const extra of combo.ingredientes_extra) {
                                const extraCost = new Decimal(extra.costo).times(combo.cantidad);
                                subtotal = subtotal.plus(extraCost);
                            }
                        }

                        return {
                            ...comboDetails.toObject(),
                            cantidad: combo.cantidad,
                            ingredientes_extra: combo.ingredientes_extra,
                            subtotal: subtotal.toFixed(2)
                        };
                    }
                }
                return null;
            }));

            return {
                ...order.toObject(),
                productos: productsList.filter(p => p !== null),
                combos: combosList.filter(c => c !== null)
            };
        }));

        return res.status(200).json({
            success: true,
            httpCode: 200,
            orders: detailedOrders,
            total: detailedOrders.length
        });
    }catch(error){
        handle(res, error);
    }
};

//Ordenes pendientes a domilicio por franquicia
const backOrdersAtHome = async(req, res) => {
    try{
        const isValidId = isValidObjectId(req.params.franchise);
        const id = req.params.franchise;
        if(!isValidId){
            return res.status(400).json({
                success : false,
                httpCode : 400,
                message : 'Id franquicia requerido'
            });
        }

        const orders = await orderModel.find({
            id_franquicia : id,
            estatus : 'pendiente',
            tipo_orden : 'domicilio'
        });
        
        if(!orders || orders.length < 1){
            return res.status(404).json({
                success : false,
                httpCode : 404,
                message : `No hay ordenes pendientes a domicilio`
            });
        }

         // Obtener detalles de productos y combos para cada orden
         const detailedOrders = await Promise.all(orders.map(async (order) => {
            const productsList = await Promise.all(order.productos.map(async (product) => {
                const menu = await menuModel.findById(product.id_menu);
                if (menu) {
                    const productDetails = menu.productos.id(product.id_producto);
                    if (productDetails) {
                        let subtotal = new Decimal(productDetails.costo).times(product.cantidad);

                        // Agregar costo de ingredientes extra
                        if (product.ingredientes_extra && product.ingredientes_extra.length > 0) {
                            for (const extra of product.ingredientes_extra) {
                                const extraCost = new Decimal(extra.costo).times(product.cantidad);
                                subtotal = subtotal.plus(extraCost);
                            }
                        }

                        return {
                            ...productDetails.toObject(),
                            cantidad: product.cantidad,
                            ingredientes_extra: product.ingredientes_extra,
                            subtotal: subtotal.toFixed(2)
                        };
                    }
                }
                return null;
            }));

            const combosList = await Promise.all(order.combos.map(async (combo) => {
                const menu = await menuModel.findById(combo.id_menu);
                if (menu) {
                    const comboDetails = menu.combos.id(combo.id_combo);
                    if (comboDetails) {
                        let subtotal = new Decimal(comboDetails.costo).times(combo.cantidad);

                        // Agregar costo de ingredientes extra
                        if (combo.ingredientes_extra && combo.ingredientes_extra.length > 0) {
                            for (const extra of combo.ingredientes_extra) {
                                const extraCost = new Decimal(extra.costo).times(combo.cantidad);
                                subtotal = subtotal.plus(extraCost);
                            }
                        }

                        return {
                            ...comboDetails.toObject(),
                            cantidad: combo.cantidad,
                            ingredientes_extra: combo.ingredientes_extra,
                            subtotal: subtotal.toFixed(2)
                        };
                    }
                }
                return null;
            }));

            return {
                ...order.toObject(),
                productos: productsList.filter(p => p !== null),
                combos: combosList.filter(c => c !== null)
            };
        }));

        return res.status(200).json({
            success: true,
            httpCode: 200,
            orders: detailedOrders,
            total: detailedOrders.length
        });
    }catch(error){
        handle(res, error);
    }
};

//Ordenes pendientes
const backOrdersRestaurant = async(req, res) => {
    try{
        const isValidId = isValidObjectId(req.params.franchise);
        const id = req.params.franchise;
        if(!isValidId){
            return res.status(400).json({
                success : false,
                httpCode : 400,
                message : 'Id franquicia requerido'
            });
        }

        const orders = await orderModel.find({id_franquicia : id, estatus : 'pendiente'});
        if(!orders || orders.length == 0){
            return res.status(404).json({
                success : false,
                httpCode : 404,
                message : 'No hay ordenes pendientes'
            });
        }

        return res.status(201).json({
            success : true,
            httpCode : 201,
            count : orders.length,
            orders
        });

    }catch(error){
        handle(res, error);
    }
};

//Ordenes completadas
const completedOrdersRestaurant = async(req, res) => {
    try{
        const isValidId = isValidObjectId(req.params.franchise);
        const id = req.params.franchise;
        if(!isValidId){
            return res.status(400).json({
                success : false,
                httpCode : 400,
                message : 'Id franquicia requerido'
            });
        }

        const orders = await orderModel.find({id_franquicia : id, estatus : 'completada'});
        if(!orders || orders.length == 0){
            return res.status(404).json({
                success : false,
                httpCode : 404,
                message : 'No hay ordenes completadas'
            });
        }

        return res.status(201).json({
            success : true,
            httpCode : 201,
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
                httpCode : 400,
                message : 'Id orden requerido'
            });
        }

        const order = await orderModel.findById(id);
        if(!order){
            return res.status(400).json({
                success : false,
                httpCode : 400,
                message : 'Id orden requerido'
            });
        }

        await orderModel.findByIdAndUpdate(id, { estatus : 'completada' }, { new : true });
        return res.status(201).json({
            success : true,
            httpCode : 201,
            message : 'Orden actualizada',
        });

    }catch(error){
        handle(res, error);
    }
};  

//Agregar productos a una orden
const addProductsToOrder = async(req, res) => {
    try{
        const idOrder = req.params.id;
        const prod = req.body.productos;
        const comb = req.body.combos; 
        const isValidId = isValidObjectId(idOrder);
        if (!isValidId) {
            return res.status(400).json({
                success: false,
                httpCode: 400,
                message: 'Id orden requerido'
            });
        }

        const order = await orderModel.findById(idOrder);
        if (!order) {
            return res.status(404).json({
                success: false,
                httpCode: 404,
                message: 'La orden no existe'
            });
        }

        // Validar y agregar productos
        let total = new Decimal(order.total);
        let productsList = [...order.productos];
        let combosList = [...order.combos];

        if (prod && prod.length > 0) {
            const updatedProductos = await Promise.all(prod.map(async (product) => {
                const menu = await menuModel.findById(product.id_menu);
                if (!menu) {
                    return res.status(404).json({
                        success: false,
                        message: `Id del menu no encontrado`,
                    });
                }
                const productDetails = menu.productos.id(product.id_producto);
                if (productDetails) {
                    let subtotal = new Decimal(productDetails.costo).times(product.cantidad);

                    // Agregar costo de ingredientes extra
                    if (product.ingredientes_extra && product.ingredientes_extra.length > 0) {
                        for (const extra of product.ingredientes_extra) {
                            const extraCost = new Decimal(extra.costo).times(product.cantidad);
                            subtotal = subtotal.plus(extraCost);
                        }
                    }

                    total = total.plus(subtotal);

                    return {
                        ...product,
                        nombre: productDetails.nombre,
                        pesaje: productDetails.pesaje,
                        categoria: productDetails.categoria,
                        descripcion: productDetails.descripcion,
                        costo: productDetails.costo,
                        estatus: productDetails.estatus,
                        subtotal: subtotal.toFixed(2),
                    };
                }
            }));

            productsList = [...productsList, ...updatedProductos];
        }

        // Validar y agregar combos
        if (comb && comb.length > 0) {
            const updatedCombos = await Promise.all(comb.map(async (combo) => {
                const menu = await menuModel.findById(combo.id_menu);
                if (!menu) {
                    return res.status(404).json({
                        success: false,
                        message: `Id del menu no encontrado`,
                    });
                }
                const comboDetails = menu.combos.id(combo.id_combo);
                if (comboDetails) {
                    let subtotal = new Decimal(comboDetails.costo).times(combo.cantidad);

                    // Agregar costo de ingredientes extra
                    if (combo.ingredientes_extra && combo.ingredientes_extra.length > 0) {
                        for (const extra of combo.ingredientes_extra) {
                            const extraCost = new Decimal(extra.costo).times(combo.cantidad);
                            subtotal = subtotal.plus(extraCost);
                        }
                    }

                    total = total.plus(subtotal);

                    return {
                        ...combo,
                        nombre: comboDetails.nombre,
                        descripcion: comboDetails.descripcion,
                        costo: comboDetails.costo,
                        estatus: comboDetails.estatus,
                        subtotal: subtotal.toFixed(2),
                    };
                }
            }));

            combosList = [...combosList, ...updatedCombos];
        }

        // Calcula el IVA y el total
        const iva = total.times(0.16).toFixed(2);
        const subtotal = total.minus(new Decimal(iva)).toFixed(2);

        // Actualizar la orden en la base de datos
        order.productos = productsList;
        order.combos = combosList;
        order.subtotal = parseFloat(subtotal);
        order.iva = parseFloat(iva);
        order.total = parseFloat(total);

        await order.save();

        return res.status(200).json({
            success: true,
            httpCode: 200,
            message: 'Productos y combos agregados a la orden',
            order,
        });
    }catch(error){
        handle(res, error);
    }
};

//Eliminar productos a una orden
const removeProductsToOrder = async(req, res) => {
    try{
        const idOrder = req.params.id;
        const { productos, combos } = req.body;

        const isValidId = isValidObjectId(idOrder);
        if (!isValidId) {
            return res.status(400).json({
                success: false,
                httpCode: 400,
                message: 'Id orden requerido'
            });
        }

        const order = await orderModel.findById(idOrder);
        if (!order) {
            return res.status(404).json({
                success: false,
                httpCode: 404,
                message: 'La orden no existe'
            });
        }

        // Actualizar productos
        if (productos && productos.length > 0) {
            for (const prod of productos) {
                const orderProduct = order.productos.find(p => p.id_producto.toString() === prod.id_producto);
                if (orderProduct) {
                    if (prod.cantidad >= orderProduct.cantidad) {
                        order.productos.pull({ _id: orderProduct._id });
                        console.log(`Producto eliminado: ${orderProduct._id}`);
                    } else {
                        orderProduct.cantidad -= prod.cantidad;
                        let subtotal = new Decimal(orderProduct.costo).times(orderProduct.cantidad);

                        // Actualizar costo de ingredientes extra
                        if (orderProduct.ingredientes_extra && orderProduct.ingredientes_extra.length > 0) {
                            for (const extra of orderProduct.ingredientes_extra) {
                                const extraCost = new Decimal(extra.costo).times(orderProduct.cantidad);
                                subtotal = subtotal.plus(extraCost);
                            }
                        }

                        orderProduct.subtotal = subtotal.toFixed(2);
                        console.log(`Producto actualizado: ${orderProduct._id} - Nueva cantidad: ${orderProduct.cantidad} - Nuevo subtotal: ${orderProduct.subtotal}`);
                    }
                } else {
                    console.log(`Producto no encontrado: ${prod.id_producto}`);
                }
            }
        }

        // Actualizar combos
        if (combos && combos.length > 0) {
            for (const comb of combos) {
                const orderCombo = order.combos.find(c => c.id_combo.toString() === comb.id_combo);
                if (orderCombo) {
                    if (comb.cantidad >= orderCombo.cantidad) {
                        order.combos.pull({ _id: orderCombo._id });
                        console.log(`Combo eliminado: ${orderCombo._id}`);
                    } else {
                        orderCombo.cantidad -= comb.cantidad;
                        let subtotal = new Decimal(orderCombo.costo).times(orderCombo.cantidad);

                        // Actualizar costo de ingredientes extra
                        if (orderCombo.ingredientes_extra && orderCombo.ingredientes_extra.length > 0) {
                            for (const extra of orderCombo.ingredientes_extra) {
                                const extraCost = new Decimal(extra.costo).times(orderCombo.cantidad);
                                subtotal = subtotal.plus(extraCost);
                            }
                        }

                        orderCombo.subtotal = subtotal.toFixed(2);
                        console.log(`Combo actualizado: ${orderCombo._id} - Nueva cantidad: ${orderCombo.cantidad} - Nuevo subtotal: ${orderCombo.subtotal}`);
                    }
                } else {
                    console.log(`Combo no encontrado: ${comb.id_combo}`);
                }
            }
        }

        // Recalcular subtotal, IVA y total
        let newSubtotal = new Decimal(0);
        order.productos.forEach(product => {
            newSubtotal = newSubtotal.plus(product.subtotal);
        });
        order.combos.forEach(combo => {
            newSubtotal = newSubtotal.plus(combo.subtotal);
        });

        const newIva = newSubtotal.times(0.16).toFixed(2);
        const newTotal = newSubtotal.plus(newIva).toFixed(2);

        order.subtotal = parseFloat(newSubtotal.toFixed(2));
        order.iva = parseFloat(newIva);
        order.total = parseFloat(newTotal);

        await order.save();

        return res.status(200).json({
            success: true,
            httpCode: 200,
            message: 'Items eliminados y orden actualizada',
            order
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
                httpCode : 400,
                message : 'Id orden requerido' 
            });
        }

        const order = await orderModel.findById(id);
        if(!order){
            return res.status(404).json({
                success : false,
                httpCode : 404,
                message : 'La orden no existe' 
            });
        }

        return res.status(201).json({
            success : true,
            httpCode : 201,
            message : 'Orden eliminada' 
        });
    }catch(error){
        handle(res, error);
    }
}

//Eliminar todas las ordendes de una franquicia
const deleteAllOrdersByFranchise = async(req, res) => {
    try{
        const isValidId = isValidObjectId(req.params.franchise);
        const id = req.params.franchise;
        if(!isValidId){
            return res.status(400).json({
                success : false,
                httpCode : 400,
                message : 'Id franquicia requerido'
            });
        }

        await orderModel.deleteMany({ id_franquicia : id });

        return res.status(201).json({
            success : true,
            httpCode : 201,
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
            httpCode : 201,
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
    ordersByTable,
    backOrdersRestaurant,
    backOrdersByTable,
    backOrdersAtHome,
    completedOrdersRestaurant,
    completedOrdersAtHome,
    completedOrdersByTable,
    changeOrderStatus,
    addProductsToOrder,
    removeProductsToOrder,
    deleteAllOrdersByFranchise,
    deleteOrder,
    deleteAllOrders
}