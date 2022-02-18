require('dotenv').config();
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const autor = require('../models/autor');

const Libro = require('../models/libro');

// Mostrar todos los libros (se tendrá que hacer paginación)
router.get('/', async function(pet, resp) {
    try {
        const libros = await Libro.find().populate({
            path: 'autor',
            select: 'nombre'
        });
        resp.status(200);
        resp.setHeader('Content-Type', 'application/json');
        resp.send(libros);
    } catch(err) {
        resp.status(500);
        resp.setHeader('Content-Type', 'application/json');
        resp.send({
            error: 6, 
            mensaje: mensajes_error.get(6)
        });
    }
});

// Mostrar todos los datos de un libro
router.get('/:id', getLibro, function(pet, resp) {
    resp.status(200);
    resp.setHeader('Content-Type', 'application/json');
    resp.send(resp.libro);
});

// Añadir un libro
router.post('/', async function(pet, resp, next) {
    var precio = parseFloat(pet.body.precio);
    if (!pet.body.titulo || !pet.body.precio) {
        resp.status(400);
        resp.setHeader('Content-Type', 'application/json');
        resp.send({
            error: 4,
            mensaje: mensajes_error.get(4)
        });
    } 
    else if (isNaN(precio)) {
        resp.status(400);
        resp.setHeader('Content-Type', 'application/json');
        resp.send({
            error: 8,
            mensaje: mensajes_error.get(8)
        });
    }
    else if (typeof pet.body.titulo != "string") {
        resp.status(400);
        resp.setHeader('Content-Type', 'application/json');
        resp.send({
            error: 7,
            mensaje: mensajes_error.get(7)
        });
    }
    else {
        const autor = await autor.findById(pet.body.autor);

        const libro = new Libro({
            _id: new mongoose.Types.ObjectId(),
            titulo: pet.body.titulo,
            precio: pet.body.precio,
            autor: autor._id
        });
        try {
            const nuevoLibro = await libro.save();
            autor.libros = autor.libros.concat(nuevoLibro);
            resp.status(201);
            resp.header({
                'Content-Type': 'application/json',
                'Location': 'http://' + process.env.HOST + ':' + process.env.PORT + 
                            '/libros/' + nuevoLibro._id
            });
            resp.send(nuevoLibro);
        } catch(err) {
            resp.status(500);
            resp.setHeader('Content-Type', 'application/json');
            resp.send({
                error: 6,
                mensaje: mensajes_error.get(6)
            });
        }
    }
});

// Borrar un libro 
router.delete('/:id', getLibro, async function(pet, resp) {
    try {
        await resp.libro.remove();
        resp.status(204).end();
    } catch(err) {
        resp.status(500);
        resp.setHeader('Content', 'application/json');
        resp.send({
            error: 6,
            mensaje: mensajes_error.get(6)
        });
    }
});

// Mostrar todos los comentarios de un libro
router.get('/:id/comentarios', function(pet, resp, next) {
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
        var obj = lista.get(id);
        if (obj==undefined) {
            resp.status(404);
            resp.setHeader('Content-Type', 'application/json');
            resp.send({
                error: 1,
                mensaje: mensajes_error.get(1)
            });
        }
        else {
            // Si se encuentra, se devuelven los comentarios
            var arrayComentarios = new Array();
            for (var [key, value] of lista_comentarios) {
                if (value.libro==id)
                    arrayComentarios.push(value);
            }
            obj.comentarios = arrayComentarios;
            resp.status(200);
            resp.setHeader('Content-Type', 'application/json');
            resp.send(obj);
        }
    }
});

// Escribir un comentario de un libro
router.post('/:id/comentarios', function(pet, resp, next) {
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
        var obj = lista.get(id);
        if (obj==undefined) {
            resp.status(404);
            resp.setHeader('Content-Type', 'application/json');
            resp.send({
                error: 1,
                mensaje: mensajes_error.get(1)
            });
        }
        else {
            var titulo = pet.body.titulo;
            var valoracion = pet.body.valoracion;
            var comentario = pet.body.comentario;
            if (titulo && valoracion.toString() && comentario) {
                if (valoracion<1 || valoracion>5) {
                    resp.status(400);
                    resp.setHeader('Content-Type', 'application/json');
                    resp.send({
                        error: 3,
                        mensaje: mensajes_error.get(3)
                    });
                }
                var objComentario = {
                    id: idActualComentario,
                    titulo: titulo,
                    valoracion: valoracion,
                    comentario: comentario
                };
                resp.status(201);
                resp.setHeader('Location', 'http://localhost:3000/api/libros/' + id + '/comentarios/' + idActualComentario);
                idActualComentario++;
                resp.send(objComentario);
            }
            else {
                resp.status(400);
                resp.setHeader('Content-Type', 'application/json');
                resp.send({
                    error: 4,
                    mensaje: mensajes_error.get(4)
                });
            }
        }
    }
});


router.patch("/:id", getLibro, async function(pet, resp) {
    if (pet.body.titulo != null) {
        resp.libro.titulo = pet.body.titulo;
    }
    if (pet.body.precio != null) {
        resp.libro.precio = pet.body.precio; 
    }
    
    try {
        const libroActualizado = await resp.libro.save();
        resp.status(204).end();
    } catch (err) {
        if (isNaN(parseFloat(pet.body.precio))) {
            resp.status(400).send({
                error: 8,
                mensaje: mensajes_error.get(8)
            });
        }
        else {
            resp.status(400).send({
                error: 7,
                mensaje: mensajes_error.get(7)
            });
        }
    }
});

async function getLibro(pet, resp, next) {
    var libro;
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
        libro = await Libro.findById(id);
        if (libro==null) {
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
    resp.libro = libro;
    next();
}

module.exports = router;