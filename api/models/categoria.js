const mongoose = require('mongoose');

// El titulo de la categoria debe ser único
const categoriaSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    titulo: {
        type: String,
        required: true,
        unique: true,
        cast: false
    }
});

module.exports = mongoose.model('Categoria', categoriaSchema);