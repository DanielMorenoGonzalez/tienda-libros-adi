require('dotenv').config();
const express = require('express');
const res = require('express/lib/response');
const router = express.Router();
const mongoose = require('mongoose');

const Libro = require('../models/libro');

var lista = new Map();
var idActual = 7;
lista.set(1, {id: 1, titulo: "Por si las voces vuelven", precio: 17, autor: "Angel Martin", categoria: "Cine"});
lista.set(2, {id: 2, titulo: "El ingenio de los pájaros", precio: 22, autor: "Jennifer Ackerman", categoria: "Biologia"});
lista.set(3, {id: 3, titulo: "Mujeres del alma mia", precio: 17.95, autor: "Isabel Allende", categoria: "Sociologia"});
lista.set(4, {id: 4, titulo: "Nunca", precio: 23.65, autor: "Ken Follet", categoria: "Novela negra"});
lista.set(5, {id: 5, titulo: "La conducta de los pájaros", precio: 17.55, autor: "Jennifer Ackerman", categoria: "Biologia"});
lista.set(6, {id: 6, titulo: "Las mujeres que corren con lobos", precio: 24.30, autor: "Clarissa Pinkola Estes", categoria: "Psicologia"});

var lista_comentarios = new Map();
var idActualComentario = 3;
lista_comentarios.set(1, {id: 1, titulo: "Libro apasionante", valoracion: 5, comentario: "Me ha inspirado", libro: 4})
lista_comentarios.set(2, {id: 2, titulo: "De otro nivel", valoracion: 4.5, comentario: "Recomendaría el libro a todo el mundo", libro: 4})

// Mostrar todos los libros (se tendrá que hacer paginación)
router.get('/', async function(pet, resp, next) {
    try {
        const libros = await Libro.find();
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
    /*
    // Los parámetros HTTP se obtienen como cadenas, convertirlo a entero
    var id = parseInt(pet.params.id);
    // En caso de que el parámetro no sea numérico
    if (isNaN(id)) {
        resp.status(400);
        resp.setHeader('Content-Type', 'application/json');
        resp.send({
            error: 2,
            mensaje: mensajes_error.get(2)
        })
    }
    else {
        var obj = lista.get(id);
        // En caso de no encontrar el libro
        if (obj==undefined) {
            resp.status(404);
            resp.setHeader('Content-Type', 'application/json')
            resp.send({
                error: 1,
                mensaje: mensajes_error.get(1)
            })
        }
        else {
            // Si se encuentra, se devuelve
            resp.status(200);
            resp.setHeader('Content-Type', 'application/json');
            resp.send(obj);
        }
    }
    */
});

// Añadir un libro
router.post('/', async function(pet, resp, next) {
    var precio = parseFloat(pet.params.precio);
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
            error: 2,
            mensaje: mensajes_error.get(2)
        });
    }
    else if (typeof pet.body.titulo != String) {
        resp.status(400);
        resp.setHeader('Content-Type', 'application/json');
        resp.send({
            error: 7,
            mensaje: mensajes_error.get(7)
        });
    }
    else {
        const libro = new Libro({
            _id: new mongoose.Types.ObjectId(),
            titulo: pet.body.titulo,
            precio: pet.body.precio
        });
        try {
            const nuevoLibro = await libro.save();
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
        resp.status(204);
        resp.end();
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

/*
router.patch("/:id", function(pet, resp) {
    var id = parseInt(pet.params.id)
    if (!isNaN(id)) {
        var item = lista.get(id)
        if (item) {
            var nombre = pet.body.nombre
            var comprado = pet.body.comprado
            if (nombre) {
                item.nombre = nombre
            }
            if (comprado!=undefined) {
                item.comprado = comprado
            }
            resp.status(204)
            resp.end()
            console.log(item)
        }
        else {
            resp.status(404)
            resp.send({mensaje:"El item no existe"})
        }
    }
    else {
        resp.status(400)
        resp.send({mensaje:"el id debe ser numérico"})
        
    }
});
*/

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