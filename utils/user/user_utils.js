const getDateAndTime = require('../date/date_info');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

async function createToken(user){
    try{
        const { fecha, hora } = await getDateAndTime();
        const tokenData = {
            id : user._id,
            puesto : user.puesto,
            nombre : user.nombre,
            usuario : user.usuario,
            franquicia : user.id_franquicia,
            time : hora,
            date : fecha
        };
        const token = jwt.sign(
            tokenData, 
            process.env.SECRET_KEY,
            { expiresIn: '12h', algorithm: 'HS256' }
        );
        return { token };
    }catch(error){
        console.error(error);
        throw new Error('Error al crear el token');
    }
}

async function getIdFromToken(token){
    try{
        if(!token){
            throw new Error('Token no proporcionado');
        }

        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        return decoded.id;
    }catch(error){
        console.error(error);
        throw new Error('Error al obtener el id del token');
    }
}

async function getIdFranchiseFromToken(token){
    try{
        if(!token){
            throw new Error('Token no proporcionado');
        }

        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        return decoded.franquicia;
    }catch(error){
        console.error(error);
        throw new Error('Error al obtener el id de la franquicia del token');
    }
}

module.exports = {
    createToken,
    getIdFromToken,
    getIdFranchiseFromToken
} 