const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
dotenv.config();

function authToken(){
    const allowedUsers = ['gerente', 'mesero'];
    return async function(req, res, next){
        const token = req.body.token;

        if(!token){
            return res.status(401).json({
                success : false,
                httpCode : 401,
                message : 'Token no proporcionado'
            });
        }

        try{
            const decoded = await jwt.verify(token, process.env.SECRET_KEY);
            if(!decoded || !allowedUsers.includes(decoded.puesto)){
                return res.status(403).json({
                    success : false,
                    httpCode : 403,
                    message : 'Acceso no autorizado'
                });
            }
            next();
        }catch(error){
            if(error.name === 'TokenExpiredError'){
                return res.status(403).json({
                    success : false,
                    httpCode : 403,
                    message : 'Token expirado',
                    expiredAt : error.expiredAt
                });
            }else{
                return res.status(400).json({
                    success : false,
                    httpCode : 400,
                    message : 'Token invalido',
                }); 
            }
        }
    }
}

module.exports = { authToken };