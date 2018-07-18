//Requires
var express = require('express');

var mdAuth = require('../middelwares/auth');

var app = express();

var Medico = require('../models/medico');

/** ====================================
 * Obtener medicos
 * ====================================
 */
app.get('/', (req, res, next) => {

    var ofSet = req.query.ofSet || 0;
    ofSet = Number(ofSet);

    Medico.find({})
        .skip(ofSet)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('hospital', 'nombre email')
        .exec((err, medicos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    message: 'Error al cargar los medicos',
                    errors: err
                });
            }

            Medico.count({}, (err, conteo) => {
                res.status(200).json({
                    ok: true,
                    medicos: medicos,
                    total: conteo
                });
            });
        });
});

/** ====================================
 * Crear medico
 * ====================================
 */
app.post('/', mdAuth.verifyToken, (req, res) => {

    var body = req.body;

    //Referencia del modelo de los medicos
    var medico = new Medico({
        nombre: body.nombre,
        usuario: req.usuario._id,
        hospital: body.hospital
    });

    medico.save((err, _medicoSave) => {

        if (err) {
            return res.status(400).json({
                ok: false,
                message: 'Error al crear medico',
                errors: err
            });
        }

        res.status(201).json({
            ok: true,
            medico: _medicoSave
        });

    });
});

/** ====================================
 * Actualizar medico por ID
 * ====================================
 */
app.put('/:id', mdAuth.verifyToken, (req, res) => {

    var id = req.params.id;
    var body = req.body;

    Medico.findById(id, (err, medico) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error al buscar el medico',
                errors: err
            });
        }

        if (!medico) {
            return res.status(400).json({
                ok: false,
                message: `El medico con el id ${id}, No existe`,
                errors: { message: 'No existe un medico con ese ID' }
            });
        }

        //Modelo de datos para actualizar
        medico.nombre = body.nombre;
        medico.usuario = req.usuario._id;
        medico.hospital = body.hospital;

        medico.save((err, _medicoSave) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    message: 'Error al actualizar medico',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                medico: _medicoSave
            });
        });
    });
});

/** ====================================
 * Eliminar medico por ID
 * ====================================
 */
app.delete('/:id', mdAuth.verifyToken, (req, res) => {

    var id = req.params.id;

    Medico.findByIdAndRemove(id, (err, _medicoDelete) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error al eliminar medico',
                errors: err
            });
        }

        if (!_medicoDelete) {
            return res.status(400).json({
                ok: false,
                message: 'No existe un medico con ese ID',
                errors: { message: 'No existe un medico con ese ID' }
            });
        }

        res.status(200).json({
            ok: true,
            medico: _medicoDelete
        });
    });
});

module.exports = app;