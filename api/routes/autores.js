require('dotenv').config();
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Autor = require('../models/autor');

var lista = new Map();
lista.set(1, {id: 1, titulo: "Por si las voces vuelven", precio: 17, autor: "Angel Martin", categoria: "Cine"});
lista.set(2, {id: 2, titulo: "El ingenio de los pájaros", precio: 22, autor: "Jennifer Ackerman", categoria: "Biologia"});
lista.set(3, {id: 3, titulo: "Mujeres del alma mia", precio: 17.95, autor: "Isabel Allende", categoria: "Sociologia"});
lista.set(4, {id: 4, titulo: "Nunca", precio: 23.65, autor: "Ken Follet", categoria: "Novela negra"});
lista.set(5, {id: 5, titulo: "La conducta de los pájaros", precio: 17.55, autor: "Jennifer Ackerman", categoria: "Biologia"});
lista.set(6, {id: 6, titulo: "Las mujeres que corren con lobos", precio: 24.30, autor: "Clarissa Pinkola Estes", categoria: "Psicologia"});

var lista_autores = new Map();
lista_autores.set(1, {id: 1, nombre: "Angel Martin", biografia: "Esta es la biografia de Angel Martin"});
lista_autores.set(2, {id: 2, nombre: "Isabel Allende", biografia: "Esta es la biografia de Isabel Allende"});
lista_autores.set(3, {id: 3, nombre: "Ken Follet", biografia: "Esta es la biografia de Ken Follet"});
lista_autores.set(4, {id: 4, nombre: "Jennifer Ackerman", biografia: "Esta es la biografia de Jennifer Ackerman"});
lista_autores.set(5, {id: 5, nombre: "Clarissa Pinkola Estes", biografia: "Esta es la biografia de Clarissa Pinkola Estes"});

// Todos los autores (habrá que hacer paginación)
router.get('/', async function(pet, resp) {
    try {
        const autores = await Autor.find();
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

module.exports = router;