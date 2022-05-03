require('dotenv').config();
const express = require('express');
const jwt = require('jwt-simple');

//Middleware: lo pondremos ANTES de procesar cualquier petición que requiera autentificación
function chequeaJWT(pet, resp, next) {
    var token = getTokenFromAuthHeader(pet);

    try {
        var decoded = jwt.decode(token, process.env.SECRET);
    } catch(err) {
       console.log(err.message);
    }

    if(decoded) {
        //Al llamar a next, el middleware "deja pasar" a la petición
        //llamando al siguiente middleware
        next();
    }
    else {
        resp.status(403);
        resp.setHeader('Content-Type', 'application/json');
        resp.send({
            error: 12,
            mensaje: mensajes_error.get(12)
        });
    }
}

//Si en la petición HTTP "pet" existe una cabecera "Authorization"
//con el formato "Authorization: Bearer XXXXXX"  
//devuelve el XXXXXX (en JWT esto sería el token)
function getTokenFromAuthHeader(pet) {
    var cabecera = pet.header('Authorization');
    if(cabecera) {
        //Parte el string por el espacio. Si está, devolverá un array de 2
        //la 2ª pos será lo que hay detrás de "Bearer"
        var campos = cabecera.split(' ');
        if(campos.length>1 && cabecera.startsWith('Bearer')) {
            return campos[1];
        }
    }
    return undefined;
}

module.exports = {chequeaJWT}