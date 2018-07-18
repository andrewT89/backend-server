//Importacion de libreria del token
var jwt = require('jsonwebtoken');
var SEDD = require('../config/config').SEDD;

/** ====================================
 * Verificación del jwt token
 * ====================================
 */
exports.verifyToken = function(req, res, next) {

    var token = req.query.token;

    jwt.verify(token, SEDD, (err, decoded) => {

        if (err) {
            return res.status(401).json({
                ok: false,
                message: 'Token no valido',
                errors: err
            });
        }

        req.usuario = decoded.usuario;

        next();

    });
};