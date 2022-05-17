require('dotenv').config();
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Compra = require('../models/compra');
const Libro = require('../models/libro');
const User = require('../models/user')
const { chequeaJWT } = require("../utils/auth");

/**
 * @swagger
 * components:
 *  schemas:
 *      Compra:
 *          type: object
 *          required:
 *              - vendedor
 *              - comprador
 *              - libro
 *              - valoracion
 *          properties:
 *              id:
 *                  type: string
 *                  description: ID autogenerado de la compra
 *              vendedor:
 *                  type: string
 *                  description: ID del usuario que vende el libro
 *              comprador:
 *                  type: string
 *                  description: ID del usuario que compra el libro
 *              libro:
 *                  type: string
 *                  description: ID del libro
 *              valoracion:
 *                  type: integer
 *                  description: Número entre 1 y 5 que representa la valoración de la compra
 *          example:
 *              id: 6242c4d343de650304df4p3e
 *              vendedor: 627e0c6ea5b4f89db9f0cac9
 *              comprador: 627e0c45a5b4f89db9f0cac5
 *              libro: 6242c55e43de650304df4ca6
 *              valoracion: 5
 */

/**
 * @swagger
 * /api/compras:
 *  post:
 *      summary: Realizar una compra
 *      tags: [Compras]
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          vendedor:
 *                              type: string
 *                              example: 627e0c6ea5b4f89db9f0cac9
 *                          comprador:
 *                              type: string
 *                              example: 627e0c45a5b4f89db9f0cac5
 *                          libro:
 *                              type: string
 *                              example: 6242c55e43de650304df4ca6
 *                          valoracion:
 *                              type: integer
 *                              example: 5
 *                      required:
 *                          - vendedor
 *                          - comprador
 *                          - libro
 *                          - valoracion               
 *      responses:
 *          201:
 *              description: Compra realizada con éxito
 *              content: 
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/Compra'
 *              headers:
 *                  Location:
 *                      type: string
 *                      description: URL de la nueva compra
 *          400:
 *              description: Datos incorrectos o falta algún campo
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/Error'
 *                      examples:
 *                          cod4:
 *                              summary: Código de error 4
 *                              value:
 *                                  error: 4
 *                                  mensaje: Falta algún campo por rellenar
 *                          cod8:
 *                              summary: Código de error 8
 *                              value:
 *                                  error: 8
 *                                  mensaje: No es un número
 *                          cod3:
 *                              summary: Código de error 3
 *                              value:
 *                                  error: 3
 *                                  mensaje: Valoración no válida. Debe estar entre 1 y 5
 *                          cod13:
 *                              summary: Código de error 13
 *                              value:
 *                                  error: 13
 *                                  mensaje: El libro no pertenece al vendedor
 *                          cod14:
 *                              summary: Código de error 14
 *                              value:
 *                                  error: 14
 *                                  mensaje: El libro no está disponible a la venta
 *          403:
 *              description: No tienes permisos
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/Error'
 *                      examples:
 *                          cod12:
 *                              summary: Código de error 12
 *                              value:
 *                                  error: 12
 *                                  mensaje: No tienes permisos
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