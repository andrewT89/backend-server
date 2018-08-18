//Requires
let express = require('express');
//Libreria para encriptar contraseña una sola via
var bcrypt = require('bcryptjs');

//Importacion de libreria del token
var jwt = require('jsonwebtoken');

var SEDD = require('../config/config').SEDD;

var app = express();

//Modelo de datos del usuario
let Usuario = require('../models/usuario');

//GOOGLE
const { OAuth2Client } = require('google-auth-library');
var CLIENT_ID = require('../config/config').CLIENT_ID;
const client = new OAuth2Client(CLIENT_ID);

/**
 * ======================================
 * Verificacion de token con async await
 * ======================================
 */
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    // const userid = payload['sub'];
    // If request specified a G Suite domain:
    //const domain = payload['hd'];

    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true
    };
}

/**
 * ====================================
 * Autenticación con google
 * ====================================
 */
app.post('/google', async(req, res) => {

    var token = req.body.token;

    var googleUser = await verify(token)
        .catch(e => {
            return res.status(403).json({
                ok: false,
                mensaje: 'Token no válido'
            });
        });


    Usuario.findOne({ email: googleUser.email }, (err, _userDB) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }

        if (_userDB) {

            if (_userDB.google === false) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Debe de usar su autenticación normal'
                });
            } else {
                var token = jwt.sign({ usuario: _userDB }, SEDD, { expiresIn: 14400 }); // 4 horas

                res.status(200).json({
                    ok: true,
                    usuario: _userDB,
                    token: token,
                    id: _userDB._id
                });
            }

        } else {
            // El usuario no existe... hay que crearlo
            var usuario = new Usuario();

            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = googleUser.google;
            usuario.password = ':)';


            usuario.save((err, _userDB) => {

                var token = jwt.sign({ usuario: _userDB }, SEDD, { expiresIn: 14400 }); // 4 horas

                res.status(200).json({
                    ok: true,
                    usuario: _userDB,
                    token: token,
                    id: _userDB._id
                });
            });
        }
    });
});

/**
 * ====================================
 * Autenticación normal
 * ====================================
 */
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
        console.log(token);
        return res.status(200).json({
            ok: true,
            usuario: _userDB,
            token: token,
            id: _userDB.id
        });
    });
});



module.exports = app;