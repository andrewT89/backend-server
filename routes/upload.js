//Requires
var express = require('express');

//Libreria para subir archivos
const fileUpload = require('express-fileupload');
var fs = require('fs');

var app = express();

//Importar modelos de colecciones
var Usuario = require('../models/usuario');
var Medico = require('../models/medico');
var Hospital = require('../models/hospital');

// default options
app.use(fileUpload());


app.put('/:type/:id', (req, res, next) => {

    var type = req.params.type;
    var id = req.params.id;

    //tipos de colección
    var typesValidate = ['hospitales', 'medicos', 'usuarios'];

    if (typesValidate.indexOf(type) < 0) {
        return res.status(400).json({
            ok: false,
            message: 'Tipo de colección no es valida',
            errors: { message: 'Tipo de colección no es valida' }
        });
    }

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            message: 'No selecciono nada',
            errors: { message: 'Debe de seleccionar un archivo' }
        });
    }

    //Obtener nombre del archivo
    var file = req.files.image;
    var fileNameCut = file.name.split('.');
    var extendFile = fileNameCut[fileNameCut.length - 1];

    //Extensiones validas
    var extendsValidate = ['jpg', 'png', 'gif', 'jpeg'];

    if (extendsValidate.indexOf(extendFile) < 0) {
        return res.status(400).json({
            ok: false,
            message: 'Extensión no valida',
            errors: { message: 'Las extensiones validas son:' + extendsValidate.join(', ') }
        });
    }

    //nombre personalizado del archivo
    var nameFile = `${id}-${new Date().getMilliseconds()}.${extendFile}`;

    //mover archivo del tmp al path
    var path = `./uploads/${type}/${nameFile}`;
    file.mv(path, err => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Error al mover el archivo',
                errors: err
            });
        }

        upFile(type, id, nameFile, res);
    });
});

function upFile(type, id, nameFile, res) {

    //Asignar y actualizar imagen de usuarios
    if (type === 'usuarios') {
        Usuario.findById(id, (err, usuario) => {

            if (!usuario) {
                return res.status(400).json({
                    ok: true,
                    message: 'No existe el Usuario',
                    errors: { message: 'No existe el Usuario' }
                });
            }

            var pathOld = './uploads/usuarios/' + usuario.img;

            //Si existe , elimina la imagen anterior
            if (fs.existsSync(pathOld)) {
                fs.unlink(pathOld);
            }

            usuario.img = nameFile;
            usuario.save((err, _userUpdate) => {
                return res.status(200).json({
                    ok: true,
                    message: 'Imagen de usuario actualizada',
                    usuario: _userUpdate
                });
            });
        });
    }

    //Asignar y actualizar imagen de medicos
    if (type === 'medicos') {
        Medico.findById(id, (err, medico) => {

            if (!medico) {
                return res.status(400).json({
                    ok: true,
                    message: 'No existe el medico',
                    errors: { message: 'No existe el medico' }
                });
            }

            var pathOld = './uploads/medicos/' + medico.img;

            //Si existe , elimina la imagen anterior
            if (fs.existsSync(pathOld)) {
                fs.unlink(pathOld);
            }

            medico.img = nameFile;
            medico.save((err, _medicoUpdate) => {
                return res.status(200).json({
                    ok: true,
                    message: 'Imagen de medico actualizada',
                    medico: _medicoUpdate
                });
            });
        });
    }

    //Asignar y actualizar imagen de hospitales
    if (type === 'hospitales') {
        Hospital.findById(id, (err, hospital) => {

            if (!hospital) {
                return res.status(400).json({
                    ok: true,
                    message: 'No existe el hospital',
                    errors: { message: 'No existe el hospital' }
                });
            }

            var pathOld = './uploads/hospitales/' + hospital.img;

            //Si existe , elimina la imagen anterior
            if (fs.existsSync(pathOld)) {
                fs.unlink(pathOld);
            }

            hospital.img = nameFile;
            hospital.save((err, _hospitalUpdate) => {
                return res.status(200).json({
                    ok: true,
                    message: 'Imagen de hospital actualizada',
                    hospital: _hospitalUpdate
                });
            });
        });
    }

}

module.exports = app;