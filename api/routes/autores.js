require('dotenv').config();
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Autor = require('../models/autor');
const { resultadosPaginados } = require('../routes/libros');

// CASO DE USO: Un usuario sin estar autentificado debe poder ver todos los autores
router.get('/', resultadosPaginados(Autor), async function(pet, resp) {
    resp.status(200);
    resp.setHeader('Content-Type', 'application/json');
    resp.send(resp.resultadosPaginados);
});

// CASO DE USO: Un usuario sin estar autentificado debe poder ver los datos de un autor
router.get('/:id', getAutor, function(pet, resp) {
    resp.status(200);
    resp.setHeader('Content-Type', 'application/json');
    resp.send(resp.autor);
});

async function getAutor(pet, resp, next) {
    var autor;
    // Validamos el ObjectId (cambiamos isNaN por match)
    var id = pet.params.id.match(/^[0-9a-fA-F]{24}$/);
    
    if (!id) {
        return resp.status(400)
                .setHeader('Content-Type', 'application/json')
                .send({
                    error: 2,
                    mensaje: mensajes_error.get(2)
                });
    }
    try {
        autor = await Autor.findById(id).populate({
            path: 'libros',
            select: 'titulo precio'
        });

        if (autor==null) {
            return resp.status(404)
                    .setHeader('Content-Type', 'application/json')
                    .send({
                        error: 1,
                        mensaje: mensajes_error.get(1)
                    })
        }
    } catch (err) {
        return resp.status(500)
                .setHeader('Content-Type', 'application/json')
                .send({
                    error: 6,
                    mensaje: mensajes_error.get(6)
                })
    }
    resp.autor = autor;
    next();
}

module.exports = router;