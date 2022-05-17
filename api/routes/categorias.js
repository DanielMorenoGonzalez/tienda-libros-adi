require('dotenv').config();
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Categoria = require('../models/categoria');
const { resultadosPaginados } = require('../routes/libros');

/**
 * @swagger
 * components:
 *  schemas:
 *      Categoria:
 *          type: object
 *          required:
 *              - titulo
 *              - libros
 *          properties:
 *              id:
 *                  type: string
 *                  description: ID autogenerado de la categoría
 *              titulo:
 *                  type: string
 *                  description: Título de la categoría
 *              libros:
 *                  type: array
 *                  description: Array con los IDs de los libros que pertenecen a la categoría    
 *          example:
 *              id: 6242c38a8de0ff314ecca275
 *              titulo: Autoayuda
 *              libros: [6242c4d343de650304df4c9a, 6242c51043de650304df4ca0]
 */

/**
 * @swagger
 * /api/categorias:
 *  get:
 *      summary: Obtener un listado de las categorías por paginación
 *      tags: [Categorias]
 *      parameters:
 *          - in: query
 *            name: limit
 *            schema:
 *              type: integer
 *            description: Número de recursos a mostrar
 *          - in: query
 *            name: offset
 *            schema:
 *              type: integer
 *            description: Número de items a saltar antes de empezar a mostrar la colección    
 *      responses:
 *          200:
 *          500:
 *              description: Error del servidor
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/Error'
 *                      examples:
 *                          cod6:
 *                              summary: Código de error 6
 *                              value:
 *                                  error: 6
 *                                  mensaje: Error del servidor
 */
router.get('/', resultadosPaginados(Categoria), async function(pet, resp) {
    resp.status(200);
    resp.setHeader('Content-Type', 'application/json');
    resp.send(resp.resultadosPaginados);
});

/**
 * @swagger
 * /api/categorias/{id}:
 *  get:
 *      summary: Obtener una categoría por su ID
 *      tags: [Categorias]
 *      parameters:
 *          - in: path
 *            name: id
 *            schema:
 *              type: string
 *            required: true
 *            description: ID de la categoría
 *      responses:
 *          200:
 *            description: Ok
 *            contents:
 *              application/json:
 *                  schema:
 *                      $ref: '#/components/schemas/Categoria'
 *          400:
 *              description: Datos incorrectos o falta algún campo
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/Error'
 *                      examples:
 *                          cod2:
 *                              summary: Código de error 2
 *                              value:
 *                                  error: 2
 *                                  mensaje: No es un ID válido (longitud de 24 en hexadecimal)
 *          404:
 *              description: Recurso no encontrado
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/Error'
 *                      examples:
 *                          cod1:
 *                              summary: Código de error 1
 *                              value:
 *                                  error: 1
 *                                  mensaje: Recurso no encontrado
 *          500:
 *              description: Error del servidor
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/Error'
 *                      examples:
 *                          cod6:
 *                              summary: Código de error 6
 *                              value:
 *                                  error: 6
 *                                  mensaje: Error del servidor
 */
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