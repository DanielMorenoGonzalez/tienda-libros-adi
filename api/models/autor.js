const mongoose = require('mongoose');

const autorSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    nombre: {
        type: String,
        required: true
    },
    biografia: {
        type: String,
        required: true
    },
    libros: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Libro'
    }]
},
{
    collection: 'autores'
});

module.exports = mongoose.model('Autor', autorSchema);