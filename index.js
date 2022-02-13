var express = require('express');
var morgan = require('morgan');
//var config = require('./config.js');
require('dotenv').config();
var app = express();

const mongoose = require('mongoose');

app.use(express.json());
app.use(morgan('dev'));

const uri = 'mongodb+srv://dmg66:' + process.env.MONGO_ATLAS_PW + '@tienda-libros-adi.va7dm.mongodb.net/librosDB?retryWrites=true&w=majority';
mongoose.connect(uri).then(
    () => { console.log("Conectado a la base de datos " + process.env.MONGO_ATLAS_DB + " con éxito") },
    err => { console.log(err) }
);

const librosRoutes = require('./api/routes/libros');
app.use('/api/libros', librosRoutes);

const autoresRoutes = require('./api/routes/autores');
app.use('/api/autores', autoresRoutes);

const categoriasRoutes = require('./api/routes/categorias');
app.use('/api/categorias',categoriasRoutes);

app.set('json spaces', 2)

global.mensajes_error = new Map([
    [1, 'Recurso no encontrado'],
    [2, 'No es un ID válido; LONGITUD de 24 en hexadecimal'],
    [3, 'Valoración no válida. Debe estar entre 1 y 5'],
    [4, 'Falta algún campo por rellenar'],
    [5, 'La palabra después del símbolo - no puede estar vacía'],
    [6, 'Error del servidor'],
    [7, 'No es una cadena de texto'],
    [8, 'No es un número']
]);

//Este método delega en el server.listen "nativo" de Node
app.listen(process.env.PORT, function () {
    console.log("El servidor express está en el puerto " + process.env.PORT);
});

