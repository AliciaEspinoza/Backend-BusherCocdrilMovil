const userModel = require('../../models/users/user');
const handle = require('../../../../NodejsAlicia/BusherCocdrilMovil/Server/utils/handle/handle_error');
const getDateAndTime = require('../../../../NodejsAlicia/BusherCocdrilMovil/Server/utils/date/date_info');

const bcrypt = require('bcrypt');

const login = async(req, res) => {
    try{
        const { nombre, password } = req.body;

        const user = await userModel.findOne({ nombre : nombre});
        if(!user){
            return res.status(404).json({
                success : true,
                errorCode : 404,
                message : 'El usuario no existe'
            });
        }

        if(bcrypt.compareSync(password, user.password)){
            return res.status(200).json({
                success : true,
                message : 'Sesion iniciada',
            });
        }else{
            return res.status(401).json({
                success : false,
                message : 'Usuario y/o contraseña incorrectos',
            });
        }
    }catch(error){
        handle(res, error);
    }
}

module.exports = {
    login,  
}