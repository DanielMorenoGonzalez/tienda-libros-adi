const mongoose = require('mongoose');

const compraSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    vendedor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    comprador: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    libro: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Libro'
    },
    valoracion: {
        type: Number,
        required: true
    }
});

compraSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        delete returnedObject.__v
    }
});

module.exports = mongoose.model('Compra', compraSchema);