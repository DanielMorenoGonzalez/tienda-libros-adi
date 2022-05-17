require('dotenv').config();
const bcrypt = require('bcrypt');
const express = require('express');
const router = express.Router();
const jwt = require('jwt-simple');
const User = require('../models/user');
const moment = require('moment');  //para trabajar cómodamente con fechas

/**
 * @swagger
 * /api/login:
 *  post:
 *      summary: Login
 *      tags: [Login]
 *      requestBody:
 *          required: true
 *          content:
 *              application/json:
 *                  schema:
 *                      type: object
 *                      properties:
 *                          username:
 *                              type: string
 *                              example: danimoreno94
 *                          password:
 *                              type: string
 *                              example: 123456
 *                      required:
 *                          - username
 *                          - password
 *      responses:
 *          200:
 *              description: Login correcto
 *              content:
 *                  application/json:
 *                      schema:
 *                          type: object
 *                          properties:
 *                              token:
 *                                  type: string
 *                                  example: eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VybmFtZSI6ImRhbmltb3Jlbm85NCIsImV4cCI6MTY1MzAzMjc0NTg0MH0.1q00ntmQ6FGd-DjLcji0DA-xGFrXRAGgCIEFTvTEX9c
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
 *          401:
 *              description: No tienes autorización
 *              content:
 *                  application/json:
 *                      schema:
 *                          $ref: '#/components/schemas/Error'
 *                      examples:
 *                          cod11:
 *                              summary: Código de error 11
 *                              value:
 *                                  error: 11
 *                                  mensaje: Username o contraseña incorrectos
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
// CASO DE USO: Un usuario debe poder hacer login
router.post('/', async (pet, resp) => {
    if (!pet.body.username || !pet.body.password) {
        resp.status(400);
        resp.setHeader('Content-Type', 'application/json');
        resp.send({
            error: 4,
            mensaje: mensajes_error.get(4)
        });
    }
    else {
        // Comprobamos si existe el username en la BD
        const user = await User.findOne({username: pet.body.username})
        if (!user) {
            resp.status(401);
            resp.send({
                error: 11,
                mensaje: mensajes_error.get(11)
            });
        }
        else {
            // Comprobamos si la contraseña es correcta
            const validPassword = await bcrypt.compare(pet.body.password, user.password);
            if (!validPassword) {
                resp.status(401);
                resp.send({
                    error: 11,
                    mensaje: mensajes_error.get(11)
                });
            }
            else {
                // Añadimos fecha de expiración en el payload
                // Con esto solucionamos el problema de que el mismo payload siempre genera el mismo JWT si no cambiamos el secret
                var payload = {
                    username: user.username,
                    exp: moment().add(7, 'days').valueOf()
                }
                
                var token = jwt.encode(payload, process.env.SECRET);
                resp.status(200);
                resp.setHeader('Content-Type', 'application/json');
                resp.send({token});
            }
        }
    }
});

module.exports = router;