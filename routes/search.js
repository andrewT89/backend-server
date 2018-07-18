//Requires
var express = require('express');

var app = express();

var Hospital = require('../models/hospital');
var Medico = require('../models/medico');
var Usuario = require('../models/usuario');

/** 
 * =========================
 * Busqueda por colección
 * =========================
 */
app.get('/coleccion/:table/:search', (req, res) => {

    let search = req.params.search,
        table = req.params.table,
        regex = new RegExp(search, 'i'),
        promise;

    switch (table) {
        case 'usuarios':
            promise = searchUsers(search, regex);
            break;
        case 'medicos':
            promise = searchMedicos(search, regex);
            break;
        case 'hospitales':
            promise = searchHospitals(search, regex);
            break;
        default:
            return res.status(400).json({
                ok: false,
                mensaje: 'Los tipos de busqueda sólo son: usuarios, medicos y hospitales',
                error: { message: 'Tipo de tabla/colección no valido' }
            });
    }

    promise.then(data => {
        res.status(200).json({
            ok: true,
            [table]: data
        });
    });
});

/**
 * =========================
 * Busqueda General
 * =========================
 */
app.get('/all/:search', (req, res, next) => {

    var search = req.params.search;
    var regex = new RegExp(search, 'i');

    Promise.all([
        searchHospitals(search, regex),
        searchMedicos(search, regex),
        searchUsers(search, regex)
    ]).then(response => {
        res.status(200).json({
            ok: true,
            hospitales: response[0],
            medicos: response[1],
            usuarios: response[2]
        });
    });
});

function searchHospitals(search, regex) {

    return new Promise((resolve, reject) => {

        Hospital.find({ nombre: regex })
            .populate('usuario', 'nombre email')
            .exec((err, hospitales) => {

                if (err) {
                    reject('Error al cargar hospitales', err);
                } else {
                    resolve(hospitales);
                }
            });
    });
}

function searchMedicos(search, regex) {

    return new Promise((resolve, reject) => {

        Medico.find({ nombre: regex })
            .populate('usuario', 'nombre email')
            .populate('hospital')
            .exec((err, medicos) => {

                if (err) {
                    reject('Error al cargar medicos', err);
                } else {
                    resolve(medicos);
                }
            });
    });
}

function searchUsers(search, regex) {

    return new Promise((resolve, reject) => {

        Usuario.find({}, 'nombre email role')
            .or([{ 'nombre': regex }, { 'email': regex }])
            .exec((err, users) => {

                if (err) {
                    reject('Error al cargar usuarios', err);
                } else {
                    resolve(users);
                }
            });
    });
}

module.exports = app;