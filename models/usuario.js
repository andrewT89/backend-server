var mongoose = require('mongoose');
var uniqueValidator = require('mongoose-unique-validator');

var Schema = mongoose.Schema;

var roleValidate = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} este no es un rol valido'
};

//Modelo de datos
var usuarioSchem = new Schema({
    nombre: { type: String, required: [true, 'El nombre es requerido'] },
    email: { type: String, unique: true, required: [true, 'El correo es requerido'] },
    password: { type: String, required: [true, 'La contraseña es requerido'] },
    img: { type: String, required: false },
    role: { type: String, required: true, default: 'USER_ROLE', enum: roleValidate },

});

usuarioSchem.plugin(uniqueValidator, { message: '{PATH} debe de ser unico' });

//Exportar modelo
module.exports = mongoose.model('usuario', usuarioSchem);