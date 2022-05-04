require('dotenv').config();
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt')
const User = require('../models/user');

// CASO DE USO: Un usuario debe poder crearse una cuenta
router.post('/', async(pet, resp) => {
    if(!pet.body.nombre || !pet.body.username || !pet.body.password
        || !pet.body.email) {
        resp.status(400);
        resp.setHeader('Content-Type', 'application/json');
        resp.send({
            error: 4,
            mensaje: mensajes_error.get(4)
        });
    } 
    else {
        // Aquí comprobamos si el usuario ya existe (tanto por su username como por su email, ya que son unique)
        const emailExists = await User.findOne({email: pet.body.email});
        const usernameExists = await User.findOne({username: pet.body.username});
        if (usernameExists) {
            resp.status(409);
            resp.send({
                error: 9,
                mensaje: mensajes_error.get(9)
            });
        }
        else if (emailExists) {
            resp.status(409);
            resp.send({
                error: 10,
                mensaje: mensajes_error.get(10)
            });
        }
        else {
            // Hasheamos la contraseña
            const passwordHash = await bcrypt.hash(pet.body.password, 10)
        
            const user = new User({
                _id: new mongoose.Types.ObjectId(),
                nombre: pet.body.nombre,
                username: pet.body.username,
                email: pet.body.email,
                password: passwordHash
            });
        
            try {
                const nuevoUser = await user.save();
                resp.status(201);
                resp.header({
                    'Content-Type': 'application/json',
                    'Location': 'http://' + process.env.HOST + ':' + process.env.PORT + 
                                '/user/' + nuevoUser._id
                });
                resp.send(nuevoUser);
            } catch(err) {
                resp.status(500);
                resp.setHeader('Content', 'application/json');
                resp.send({
                    error: 6,
                    mensaje: mensajes_error.get(6)
                });
            }
        }
    }
});

// CASO DE USO: Un usuario sin estar autentificado debe poder ver el perfil de otro usuario
router.get('/:username', getUserByUsername, async(pet, resp, next) => {
    resp.status(200);
    resp.setHeader('Content-Type', 'application/json');
    resp.send(resp.user);
});

async function getUserByUsername(pet, resp, next) {
    var user;

    try {
        user = await User.findOne({username: pet.params.username})
                        .select('nombre username email libros');
        if (user==null) {
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

    resp.user = user;
    next();
}

module.exports = router;