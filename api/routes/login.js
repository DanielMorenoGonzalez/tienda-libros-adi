require('dotenv').config();
const bcrypt = require('bcrypt');
const express = require('express');
const router = express.Router();
const jwt = require('jwt-simple');
const User = require('../models/user');
const moment = require('moment');  //para trabajar cómodamente con fechas

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