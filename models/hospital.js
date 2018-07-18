var mongoose = require('mongoose');

var Schema = mongoose.Schema;

//Modelo de datos
var hospitalSchema = new Schema({
    nombre: { type: String, required: [true, 'El nombre	es	necesario'] },
    img: { type: String, required: false },
    usuario: { type: Schema.Types.ObjectId, ref: 'usuario' }
}, { collection: 'hospitales' });

//Eportar modelo
module.exports = mongoose.model('hospital', hospitalSchema);