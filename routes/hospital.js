//Requires
var express = require('express');

var mdAuth = require('../middelwares/auth');

var app = express();

var Hospital = require('../models/hospital');

/** ====================================
 * Obtener hospitales
 * ====================================
 */
app.get('/', (req, res, next) => {

    var ofSet = req.query.ofSet || 0;
    ofSet = Number(ofSet);

    Hospital.find({})
        .skip(ofSet)
        .limit(5)
        .populate('usuario', 'nombre email img')
        .exec(
            (err, hospitales) => {

                if (err) {
                    return res.status(500).json({
                        ok: false,
                        message: 'Error al cargar los hospitales',
                        errors: err
                    });
                }

                Hospital.count({}, (err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        hospitales: hospitales,
                        total: conteo
                    });
                });
            });
});

// ==========================================
//  Obtener Hospital por ID
// ==========================================
app.get('/:id', (req, res) => {
    var id = req.params.id;
    Hospital.findById(id)
        .populate('usuario', 'nombre img email img')
        .exec((err, hospital) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al buscar hospital',
                    errors: err
                });
            }
            if (!hospital) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'El hospital con el id ' + id + 'no existe',
                    errors: { message: 'No existe un hospital con ese ID' }
                });
            }
            res.status(200).json({
                ok: true,
                hospital: hospital
            });

        })
});

/** ====================================
 * Crear hospital
 * ====================================
 */
app.post('/', mdAuth.verifyToken, (req, res) => {

    var body = req.body;

    //Referencia del modelo de los usuarios
    var hospital = new Hospital({
        nombre: body.nombre,
        img: body.img,
        usuario: req.usuario._id
    });

    hospital.save((err, _hospitalSave) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                message: 'Error al crear hospital',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            hospital: _hospitalSave
        });

    });
});

/** ====================================
 * Actualizar hospital por ID
 * ====================================
 */
app.put('/:id', mdAuth.verifyToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Hospital.findById(id, (err, hospital) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error al buscar el hospital',
                errors: err
            });
        }

        if (!hospital) {
            return res.status(400).json({
                ok: false,
                message: `El hospital con el id ${id}, No existe`,
                errors: { message: 'No existe un hospital con ese ID' }
            });
        }

        //Modelo de datos para actualizar
        hospital.nombre = body.nombre;
        hospital.img = body.img;
        hospital.usuario = req.usuario._id;

        hospital.save((err, _hospitalSave) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    message: 'Error al actualizar hospital',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                hospital: _hospitalSave
            });
        });
    });
});

/** ====================================
 * Eliminar hospital por ID
 * ====================================
 */
app.delete('/:id', mdAuth.verifyToken, (req, res) => {

    var id = req.params.id;

    Hospital.findByIdAndRemove(id, (err, _hospitalDelete) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error al eliminar hospital',
                errors: err
            });
        }

        if (!_hospitalDelete) {
            return res.status(400).json({
                ok: false,
                message: 'No existe un hospital con ese ID',
                errors: { message: 'No existe un hospital con ese ID' }
            });
        }

        res.status(200).json({
            ok: true,
            hospital: _hospitalDelete
        });
    });
});

module.exports = app;