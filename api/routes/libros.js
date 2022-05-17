require('dotenv').config();
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Categoria = require('../models/categoria');
const Libro = require('../models/libro');
const User = require('../models/user');
const { chequeaJWT } = require("../utils/auth");

/**
 * @swagger
 * components:
 *  schemas:
 *      Libro:
 *          type: object
 *          required:
 *              - titulo
 *              - precio
 *              - autor
 *              - categoria
 *              - disponible
 *              - vendedor
 *          properties:
 *              id:
 *                  type: string
 *                  description: ID autogenerado del libro
 *              titulo:
 *                  type: string
 *                  description: Título del libro
 *              precio:
 *                  type: double
 *                  description: Precio del libro
 *              autor:
 *                  type: string
 *                  description: Autor del libro
 *              categoria:
 *                  type: string
 *                  description: ID de la categoria a la que pertenece
 *              disponible:
 *                  type: boolean
 *                  description: Verdadero (si el libro se encuentra a la venta) o falso
 *              vendedor:
 *                  type: string
 *                  description: ID del usuario que lo ha publicado
 *          example:
 *              id: 6242c4d343de650304df4c9a
 *              titulo: Encuentra tu persona vitamina
 *              precio: 18.9
 *              autor: Marian Rojas
 *              categoria: 6242c38a8de0ff314ecca275
 *              disponible: true
 *              vendedor: 627e0c45a5b4f89db9f0cac5
 *      Error:
 *          type: object
 *          properties:
 *              error:
 *                  type: integer
 *                  description: Código de error
 *              mensaje:
 *                  type: string
 *                  description: Mensaje descriptivo del error
 *              required:
 *                  - error
 *                  - mensaje
 *          example:
 *              error: 4
 *              mensaje: Falta algún campo por rellenar
 */

// CASO DE USO: Un usuario sin estar autentificado debe poder ver todos los libros del sitio
router.get('/', resultadosPaginados(Libro), async function(pet, resp) {
    resp.status(200);
    resp.setHeader('Content-Type', 'application/json');
    resp.send(resp.resultadosPaginados);
});

/**
 * @swagger
 * /api/libros/{id}:
 *  get:
 *      summary: Obtener libro por ID
 *      tags: [Libros]
 *      parameters:
 *          - in: path
 *            name: id
 *            schema:
 *              type: string
 *            required: true
 *            description: ID del libro
 *      responses:
 *          200:
 *              description: OK
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/Libro'
 *          400:
 *              description: Datos incorrectos o falta algún campo
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/Error'
 *          404:
 *              description: Recurso no encontrado
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/Error'
 *          500:
 *              description: Error del servidor
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/Error'
 */
router.get('/:id', getLibro, async function(pet, resp) {
    resp.status(200);
    resp.setHeader('Content-Type', 'application/json');
    resp.send(resp.libro);
});

// CASO DE USO: Un usuario autentificado debe poder subir un libro al sitio para venderlo
router.post('/', chequeaJWT, async function(pet, resp) {
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
    else if (typeof pet.body.titulo != "string" || typeof pet.body.autor != "string") {
        resp.status(400);
        resp.setHeader('Content-Type', 'application/json');
        resp.send({
            error: 7,
            mensaje: mensajes_error.get(7)
        });
    }
    else {
        const categoria = await Categoria.findById(pet.body.categoria);
        const vendedor = await User.findOne({username: resp.locals.userPayload.username})
        const libro = new Libro({
            _id: new mongoose.Types.ObjectId(),
            titulo: pet.body.titulo,
            precio: pet.body.precio,
            autor: pet.body.autor,
            categoria: categoria._id,
            vendedor: vendedor._id
        });
        try {
            const nuevoLibro = await libro.save();
            
            categoria.libros = categoria.libros.concat(nuevoLibro._id);
            await categoria.save();

            vendedor.libros = vendedor.libros.concat(nuevoLibro._id);
            await vendedor.save();

            resp.status(201);
            resp.header({
                'Content-Type': 'application/json',
                'Location': 'http://localhost:' + process.env.PORT + 
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

// CASO DE USO: Un usuario autentificado debe poder actualizar un libro que ya haya subido 
router.patch("/:id", chequeaJWT, getLibro, async function(pet, resp) {
    if (pet.body.titulo != null) {
        resp.libro.titulo = pet.body.titulo;
    }
    if (pet.body.precio != null) {
        resp.libro.precio = pet.body.precio; 
    }
    if (pet.body.autor != null) {
        resp.libro.autor = pet.body.autor;
    }

    if (isNaN(parseFloat(pet.body.precio))) {
        resp.status(400);
        resp.setHeader('Content-Type', 'application/json');
        resp.send({
            error: 8,
            mensaje: mensajes_error.get(8)
        });
    }
    else {
        try {
            const libroActualizado = await resp.libro.save();
            resp.status(204).end();
        } catch (err) {
            resp.status(500);
            resp.setHeader('Content-Type', 'application/json');
            resp.send({
                error: 6,
                mensaje: mensajes_error.get(6)
            });
        }
    }
});

/**
 * @swagger
 * /api/libros/{id}:
 *  delete:
 *      summary: Borrar libro por ID
 *      tags: [Libros]
 *      parameters:
 *          - in: path
 *            name: id
 *            schema:
 *              type: string
 *            required: true
 *            description: ID del libro
 *      responses:
 *          204:
 *              description: Libro borrado con éxito
 *          400:
 *              description: Datos incorrectos o falta algún campo
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/Error'
 *          404:
 *              description: Recurso no encontrado
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/Error'
 *          500:
 *              description: Error del servidor
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/Error'
 */
router.delete('/:id', chequeaJWT, getLibro, async function(pet, resp) {
    try {
        await resp.libro.remove();        
        resp.status(204).end();
    } catch(err) {
        resp.status(500);
        resp.setHeader('Content', 'application/json');
        resp.send({
            error: 6,
            mensaje: err.message
        });
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

function resultadosPaginados(modelo) {
    return async (pet, resp, next) => {
        // Soportamos también la ruta para todos los libros sin paginar
        if (Object.keys(pet.query).length === 0) {
            try {
                var resultados = "";
                if (modelo=="Libro") {
                    resultados = await modelo.find().populate({
                        path: 'categoria',
                        select: 'titulo'
                    });
                }
                else {
                    resultados = await modelo.find();
                }

                resp.resultadosPaginados = resultados;
                next();
            } catch (err) {
                resp.status(500);
                resp.setHeader('Content-Type', 'application/json');
                resp.send({
                    error: 6, 
                    mensaje: err.message
                });
            }
            
        }
        else {
            try {
                const offset = parseInt(pet.query.offset)
                const limit = parseInt(pet.query.limit);
    
                const totalResultados = await modelo.count();
                var resultados = "";
                var cadena;
                if (modelo=="Libro") {
                    resultados = await modelo.find().populate({
                        path: 'categoria',
                        select: 'titulo'
                    }).skip(offset).limit(limit);
                    cadena = "libros";
                }
                else {
                    resultados = await modelo.find().skip(offset).limit(limit);
                    cadena = "categorias";
                }
    
                var totalPaginas = Math.ceil(totalResultados / limit);
                
                var paginaActual = "";
                if (offset == 0) {
                    paginaActual = 1;
                } else {
                    paginaActual = Math.ceil(offset / limit);
                }
    
                const paginacion = {
                    total: totalResultados,
                    count: limit,
                    currentPage: paginaActual,
                    totalPages: totalPaginas,
                    pagination: {},
                    results: resultados
                }
    
                var nextURL, prevURL = null;
                paginacion.pagination.next = nextURL;
                paginacion.pagination.previous = prevURL;
    
                if ((paginaActual < totalPaginas) && ((offset+limit) < totalResultados)) {
                    nextURL = "http://localhost:" + process.env.PORT
                                + "/api/" + cadena + "?limit=" + limit + "&offset=" + (offset + limit);
                    paginacion.pagination.next = nextURL;
                }
    
                if (paginaActual > 1) {
                    prevURL = "http://localhost:" + process.env.PORT
                                + "/api/" + cadena + "?limit=" + limit + "&offset=" + (offset - limit);
                    paginacion.pagination.previous = prevURL;
                }
    
                resp.resultadosPaginados = paginacion;
                next();
            } catch(err) {
                resp.status(500);
                resp.setHeader('Content-Type', 'application/json');
                resp.send({
                    error: 6, 
                    mensaje: err.message
                });
            }
        }
    }
};

module.exports = router;
module.exports.resultadosPaginados = resultadosPaginados;