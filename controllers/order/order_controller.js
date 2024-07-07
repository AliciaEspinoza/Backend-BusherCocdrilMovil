const orderModel = require('../../models/entities/order');
const handle = require('../../utils/handle/handle_error');
const getDateAndTime = require('../../utils/date/date_info');

const registerOrder = async(req, res) => {
    try{
        const { folio, nombre, productos, combos, estatus } = req.body;
        const { fecha, hora } = await getDateAndTime();

        const newOrder = new orderModel({
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

module.exports = {
    registerOrder
}