var express = require('express');
var morgan = require('morgan');
require('dotenv').config();

const swaggerUI = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");

const options = {
   definition: {
       openapi: "3.0.0",
       info: {
           title: "API Tienda Libros",
           version: "1.0.0",
           description: "API de una tienda de libros hecho por Daniel Moreno González para la asignatura Aplicaciones Distribuidas en Internet"
       },
       servers: [
           {
               url: "http://localhost:3000"
           }
       ],  
   },
   apis: ["./api/routes/*.js"]
}

const specs = swaggerJsDoc(options);

var app = express();

app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(specs));

const mongoose = require('mongoose');

app.use(express.json());
app.use(morgan('dev'));

const uri = 'mongodb+srv://dmg66:' + process.env.MONGO_ATLAS_PW + '@tienda-libros-adi.va7dm.mongodb.net/librosDB?retryWrites=true&w=majority';
mongoose.connect(uri).then(
    () => { console.log("Conectado a la base de datos " + process.env.MONGO_ATLAS_DB + " con éxito") },
    err => { console.log(err) }
);

const usersRoutes = require('./api/routes/users');
app.use('/api/users', usersRoutes);

const librosRoutes = require('./api/routes/libros');
app.use('/api/libros', librosRoutes);

const categoriasRoutes = require('./api/routes/categorias');
app.use('/api/categorias', categoriasRoutes);

const loginRoutes = require('./api/routes/login');
app.use('/api/login', loginRoutes);

const comprasRoutes = require('./api/routes/compras');
app.use('/api/compras', comprasRoutes);

app.set('json spaces', 2)

global.mensajes_error = new Map([
    [1, 'Recurso no encontrado'],
    [2, 'No es un ID válido (longitud de 24 en hexadecimal)'],
    [3, 'Valoración no válida. Debe estar entre 1 y 5'],
    [4, 'Falta algún campo por rellenar'],
    [5, 'La palabra después del símbolo - no puede estar vacía'],
    [6, 'Error del servidor'],
    [7, 'No es una cadena de texto'],
    [8, 'No es un número'],
    [9, 'El username ya existe'],
    [10, 'El email ya existe'],
    [11, 'Username o contraseña incorrectos'],
    [12, 'No tienes permisos'],
    [13, 'El libro no pertenece al vendedor'],
    [14, 'El libro no está disponible a la venta']
]);

//Este método delega en el server.listen "nativo" de Node
app.listen(process.env.PORT, function () {
    console.log("El servidor express está en el puerto " + process.env.PORT);
});

