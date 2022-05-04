const mongoose = require('mongoose');

// No nos interesa el casteo, ya que así podemos
// capturar los distintos errores
const libroSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    titulo: {
        type: String,
        required: true,
        cast: false
    },
    precio: {
        type: Number,
        required: true,
        cast: false
    },
    disponible: {
        type: Boolean,
        default: true
    },
    autor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Autor'
    },
    categoria: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Categoria'
    },
    vendedor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
});

libroSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        delete returnedObject.__v
    }
});

module.exports = mongoose.model('Libro', libroSchema);