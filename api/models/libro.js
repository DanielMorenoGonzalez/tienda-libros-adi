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
    }
});

module.exports = mongoose.model('Libro', libroSchema);