//Requires
var express = require('express');

//Libreria para encriptar contraseña una sola via
var bcrypt = require('bcryptjs');
var salt = bcrypt.genSaltSync(10);

//Importacion de libreria del token
var jwt = require('jsonwebtoken');

var SEDD = require('../config/config').SEDD;

var app = express();

//Modelo de datos del usuario
var Usuario = require('../models/usuario');

app.post('/', (req, res) => {

    var body = req.body;

    Usuario.findOne({ email: body.email }, (err, _userDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error al buscar usuarios',
                errors: err
            });
        }

        if (!_userDB) {
            return res.status(400).json({
                ok: false,
                message: 'Credenciales incorrectas - email',
                errors: err
            });
        }

        if (!bcrypt.compareSync(body.password, _userDB.password)) {
            return res.status(400).json({
                ok: false,
                message: 'Credenciales incorrectas - password',
                errors: err
            });
        }

        //Crear un token..!!!
        _userDB.password = ':)';
        var token = jwt.sign({ usuario: _userDB }, SEDD, { expiresIn: 14400 });

        res.status(200).json({
            ok: true,
            usuario: _userDB,
            token: token,
            id: _userDB.id
        });
    });
});


module.exports = app;