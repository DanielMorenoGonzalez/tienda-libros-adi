require('dotenv').config();
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Categoria = require('../models/categoria');
const { resultadosPaginados } = require('../routes/libros');

// CASO DE USO: Un usuario sin estar autentificado debe poder ver todas las categorías existentes
router.get('/', resultadosPaginados(Categoria), async function(pet, resp) {
    resp.status(200);
    resp.setHeader('Content-Type', 'application/json');
    resp.send(resp.resultadosPaginados);
});

// CASO DE USO: Un usuario sin estar autentificado debe poder ver los libros de una categoría
router.get('/:id', getCategoria, function(pet, resp) {
    resp.status(200);
    resp.setHeader('Content-Type', 'application/json');
    resp.send(resp.categoria);
});

async function getCategoria(pet, resp, next) {
    var categoria;

    // Validamos el ObjectId (cambiamos isNaN por match)
    var id = pet.params.id.match(/^[0-9a-fA-F]{24}$/)

    if (!id) {
        return resp.status(400)
                .setHeader('Content-Type', 'application/json')
                .send({
                    error: 2,
                    mensaje: mensajes_error.get(2)
                });
    }
    try {
        categoria = await Categoria.findById(id).populate({
            path: 'libros',
            select: 'titulo autor'
        });
        

        if (categoria==null) {
            return resp.status(404)
                    .setHeader('Content-Type', 'application/json')
                    .send({
                        error: 1,
                        mensaje: mensajes_error.get(1)
                    });
        }
    } catch (err) {
        return resp.status(500)
                .setHeader('Content-Type', 'application/json')
                .send({
                    error: 6,
                    mensaje: mensajes_error.get(6)
                });
    }
    resp.categoria = categoria;
    next();
}

module.exports = router;