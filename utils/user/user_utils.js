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

module.exports = {
    createToken,

} 