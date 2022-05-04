require('dotenv').config();
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Compra = require('../models/compra');
const Libro = require('../models/libro');
const User = require('../models/user')
const { chequeaJWT } = require("../utils/auth");

// CASO DE USO: Un usuario autentificado debe poder comprar un libro
router.post('/', chequeaJWT, async function(pet, resp) {
    var puntuacion = parseInt(pet.body.valoracion);
    if (!pet.body.comprador || !pet.body.vendedor ||
        !pet.body.libro || !pet.body.valoracion) {
        resp.status(400);
        resp.setHeader('Content-Type', 'application/json');
        resp.send({
            error: 4,
            mensaje: mensajes_error.get(4)
        });
    }
    else if (isNaN(puntuacion)) {
        resp.status(400);
        resp.setHeader('Content-Type', 'application/json');
        resp.send({
            error: 8,
            mensaje: mensajes_error.get(8)
        });
    }
    else if (puntuacion<1 || puntuacion>5) {
        resp.status(400);
        resp.setHeader('Content-Type', 'application/json');
        resp.send({
            error: 3,
            mensaje: mensajes_error.get(3)
        });
    }
    else {
        const comprador = await User.findOne({username: resp.locals.userPayload.username})
        const vendedor = await User.findById(pet.body.vendedor);
        const libro = await Libro.findById(pet.body.libro);

        if (!vendedor.libros.includes(libro._id)) {
            resp.status(400);
            resp.setHeader('Content-Type', 'application/json');
            resp.send({
                error: 13,
                mensaje: mensajes_error.get(13)
            });
        }
        else if (!libro.disponible) {
            resp.status(400);
            resp.setHeader('Content-Type', 'application/json');
            resp.send({
                error: 14,
                mensaje: mensajes_error.get(14)
            });
        }
        else {
            const compra = new Compra({
                _id: new mongoose.Types.ObjectId(),
                vendedor: vendedor._id,
                comprador: comprador._id,
                libro: libro._id,
                valoracion: puntuacion
            });
            try {
                const nuevaCompra = await compra.save();

                // El libro deja de estar disponible para la venta
                libro.disponible = false;
                await libro.save();
    
                resp.status(201);
                resp.header({
                    'Content-Type': 'application/json',
                    'Location': 'http://localhost:' + process.env.PORT + 
                                '/compras/' + nuevaCompra._id
                });
                resp.send(nuevaCompra);
            } catch (err) {
                resp.status(500);
                resp.setHeader('Content-Type', 'application/json');
                resp.send({
                    error: 6,
                    mensaje: err.message
                });
            }
        }
    }
});

module.exports = router;