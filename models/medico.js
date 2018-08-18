var mongoose = require('mongoose');
var Schema = mongoose.Schema;

//Modelo
var medicoSchema = new Schema({
    nombre: { type: String, required: [true, 'El nombre	es	necesario'] },
    img: { type: String, required: false },
    usuario: { type: Schema.Types.ObjectId, ref: 'usuario', required: true },
    hospital: {
        type: Schema.Types.ObjectId,
        ref: 'hospital',
        required: [true, 'El id	hospital es un campo obligatorio ']
    }
});

//Export model
module.exports = mongoose.model('medico', medicoSchema);