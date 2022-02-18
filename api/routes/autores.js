require('dotenv').config();
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Autor = require('../models/autor');

// Todos los autores (habrá que hacer paginación)
router.get('/', async function(pet, resp) {
    try {
        const autores = await Autor.find({}).populate({
            path: 'libros',
            select: 'titulo precio'
        });
        resp.status(200);
        resp.setHeader('Content-Type', 'application/json');
        resp.send(autores);
    } catch(err) {
        resp.status(500);
        resp.setHeader('Content-Type', 'application/json');
        resp.send({
            error: 6, 
            mensaje: mensajes_error.get(6)
        });
    }
});

// Mostrar datos de un autor
router.get('/:id', getAutor, function(pet, resp) {
    resp.status(200);
    resp.setHeader('Content-Type', 'application/json');
    resp.send(resp.autor);
});

async function getAutor(pet, resp, next) {
    
    var autor;
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
        autor = await Autor.findById(id).populate('libros');
        console.log(typeof autor.libros)
        //autor = await Autor.findById(id);
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

/*
// Mostrar todos los datos de un autor, entre los que se incluyen sus libros
// La idea era hacerlo mostrando el nombre del autor en la url, pero no caí
// en que puede haber 2 autores con el mismo nombre
router.get('/:id', function(pet, resp, next) {
    var id = parseInt(pet.params.id);
    if (isNaN(id)) {
        resp.status(400);
        resp.setHeader('Content-Type', 'application/json');
        resp.send({
            error: 2,
            mensaje: mensajes_error.get(2)
        });
    }
    else {
        var obj = lista_autores.get(id);
        if (obj) {
            // Si se encuentra, necesitamos guardar todos los libros de ese autor en un array auxiliar para añadirlo como
            // atributo al objeto que queremos devolver
            var arrayLibros = new Array();
            for (var [key, value] of lista) {
                if (value.autor==obj.nombre) {
                    arrayLibros.push(value);
                }
            }
            obj.libros = arrayLibros;
            resp.status(200);
            resp.setHeader('Content-Type', 'application/json');
            resp.send(obj);
        }
        else {
            resp.status(404);
            resp.setHeader('Content-Type', 'application/json');
            resp.send({
                error: 1,
                mensaje: mensajes_error.get(1)
            });
        }
    }
});
*/

module.exports = router;