const franchiseModel = require('../../models/entities/franquicia');
const handle = require('../../utils/handle/handle_error');
const getDateAndTime = require('../../utils/date/date_info');

// Registrar nueva franquicia
const registerFranchise = async(req, res) => {
    try{
        const body = req.body;
        const { fecha, hora } = await getDateAndTime();

        const franchise = await franchiseModel.findOne({nombre : body.nombre, telefono : body.telefono});
        if(franchise){
            return res.status(400).json({
                success : false,
                errorCode : 400,
                message : 'Esta franquicia ya ha sido registrada'
            });
        }

        const newFranchise = new franchiseModel({ 
            nombre : body.nombre,
            descripcion : body.descripcion,
            direccion : body.direccion,
            email : body.email, 
            telefono : body.telefono,
            ciudad : body.ciudad,
            colonia : body.colonia,
            estatus : body.estatus,
            fecha_registro : fecha,
            hora_registro : hora,
        });
        await newFranchise.save();

        res.status(201).json({
            success : true,
            successCode : 201,
            message : 'Franquicia registrada'
        });
    }catch(error){
        handle(res, error);
    }
};

//Obtener todas las franquicias
const allFranchises = async(req, res) => {
    try{
        const franchises = await franchiseModel.find();

        if(!franchises || franchises.length == 0){
            return res.status(404).json({
                success : false,
                errorCode : 404,
                message : 'No hay franquicias registradas'
            });
        }

        return res.status(200).json({
            success : true,
            successCode : 200,
            franchises : franchises
        });

    }catch(error){
        handle(res, error);
    }
}

//Buscar franquicia por id
const searchFranchiseByID = async(req, res) => {
    try{
        const id = req.params.id;
        if(!id){
            return res.status(400).json({
                success : false,
                errorCode : 400,
                message : "Id requerido"
            });
        }

        const franchise = await franchiseModel.findById(id);

        if(!franchise){
            return res.status(404).json({
                success : false,
                errorCode : 404,
                message : 'No existe la franquicia'
            });
        }

        return res.status(201).json({
            success : true,
            successCode : 201,
            franchise : franchise
        });

    }catch(error){
        handle(res, error);
    }
}

//Eliminar franquicia
const deleteFranchise = async(req, res) => {
    try{
        const id = req.params.id;
        if(!id){
            return res.status(400).json({
                success : false,
                errorCode : 400,
                message : "Id requerido"
            });
        }


        const franchise = await franchiseModel.findById(id);
        if(!franchise){
            return res.status(404).json({
                success : false,
                errorCode : 404,
                message : "La sucursal no existe"
            });
        }

        await franchiseModel.findByIdAndDelete(id);

        return res.status(201).json({
            success : true,
            successCode : 201,
            message : 'Franquicia eliminada'
        });

    }catch(error){
        handle(res, error);
    }
}

module.exports = {
    registerFranchise,
    allFranchises,
    searchFranchiseByID,
    deleteFranchise,
};