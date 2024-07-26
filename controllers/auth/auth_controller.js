const userModel = require('../../models/users/usuario');
const handle = require('../../utils/handle/handle_error');
const { createToken } = require('../../utils/user/user_utils'); 

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

            const { token } = await createToken(user);

            return res.status(201).json({
                success : true,
                httpCode : 201,
                message : 'Sesion iniciada',
                token
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