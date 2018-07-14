// Requires
var express = require('express');
var mongoose = require('mongoose');

//Inicializar variables
var app = express();

//conexion mongodb
mongoose.connection.openUri('mongodb://localhost:27017/hospitalDB', (err, res) => {
    if (err) throw err;
    console.log('Base de Datos: \x1b[32m%s\x1b[0m', ' onLine');
});


//Rutas
app.get('/', (req, res, next) => {

    res.status(200).json({
        ok: true,
        message: 'Petición realizada correctamente'
    });

});


//Escuchar peticiones
app.listen(3000, () => {
    console.log('Express server puerto 3000: \x1b[32m%s\x1b[0m', ' onLine');
});