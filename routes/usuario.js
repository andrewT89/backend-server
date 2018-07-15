//Requires
var express = require('express');

//Libreria para encriptar contraseña una sola via
var bcrypt = require('bcryptjs');
var salt = bcrypt.genSaltSync(10);
//Importacion de libreria del token
var jwt = require('jsonwebtoken');

var mdAuth = require('../middelwares/auth');

var app = express();

var Usuario = require('../models/usuario');

/** ====================================
 * Obtener todos los usuarios
 * ====================================
 */
app.get('/', (req, res, next) => {

    Usuario.find({}, 'name email img role')
        .exec((err, usuarios) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    message: 'Error al cargar los usuarios',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                usuarios: usuarios
            });
        });
});

/** ====================================
 * Crear usuario
 * ====================================
 */
app.post('/', mdAuth.verifyToken, (req, res) => {

    var body = req.body;

    //Referencia del modelo de los usuarios
    var usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, salt),
        img: body.img,
        role: body.role
    });

    usuario.save((err, _userSave) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                message: 'Error al crear usuario',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            usuario: _userSave,
            usuarioTkoen: req.usuario
        });

    });
});

/** ====================================
 * Actualizar usuario por ID
 * ====================================
 */
app.put('/:id', mdAuth.verifyToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Usuario.findById(id, (err, usuario) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error al buscar el usuario',
                errors: err
            });
        }

        if (!usuario) {
            return res.status(400).json({
                ok: false,
                message: `El usuario con el id ${id}, No existe`,
                errors: { message: 'No existe un usuario con ese ID' }
            });
        }

        //Modelo de datos para actualizar
        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;

        usuario.save((err, _userSave) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    message: 'Error al actualizar usuario',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                usuario: _userSave
            });
        });
    });
});

/** ====================================
 * Eliminar usuario por ID
 * ====================================
 */
app.delete('/:id', mdAuth.verifyToken, (req, res) => {

    var id = req.params.id;

    Usuario.findByIdAndRemove(id, (err, _userSave) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error al eliminar usuario',
                errors: err
            });
        }

        //
        if (!_userSave) {
            return res.status(400).json({
                ok: false,
                message: 'No existe un usuario con ese ID',
                errors: { message: 'No existe un usuario con ese ID' }
            });
        }

        res.status(200).json({
            ok: true,
            usuario: _userSave
        });
    });
});

module.exports = app;