require('dotenv').config();
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const Categoria = require('../models/categoria');

// Mostrar todas las categorías
router.get('/', async function(pet, resp) {
    try {
        const categorias = await Categoria.find({}).populate({
            path: 'libros',
            select: 'titulo precio'
        });
        resp.status(200);
        resp.setHeader('Content-Type', 'application/json');
        resp.send(categorias);
    } catch(err) {
        resp.status(500);
        resp.setHeader('Content-Type', 'application/json');
        resp.send({
            error: 6, 
            mensaje: mensajes_error.get(6)
        });
    }
});

// Mostrar todos los libros de una categoría
router.get('/:titulo', function(pet, resp, next) {
    // El proceso sería muy parecido al del nombre del autor
    var titulo = pet.params.titulo.toLowerCase().split("-");
    if(!titulo[titulo.length-1]) {
        resp.status(400);
        resp.setHeader('Content-Type', 'application/json');
        resp.send({
            error: 5,
            mensaje: mensajes_error.get(5)
        });
    }
    else {
        // Aquí la diferencia que tenemos es que sólo queremos poner en mayúscula la inicial
        // de la primera palabra
        var tituloCompleto;
        var primeraPalabra = titulo[0][0].toUpperCase() + titulo[0].substring(1);

        if (titulo.length>1) 
            tituloCompleto = primeraPalabra + ' ' + titulo.slice(1).join(' ');
        else
            tituloCompleto = primeraPalabra;

        var objCategoria = lista_categorias.get(tituloCompleto);
        if (objCategoria==undefined) {
            resp.status(404);
            resp.setHeader('Content-Type', 'application/json');
            resp.send({
                error: 1,
                mensaje: mensajes_error.get(1)
            })
        }
        else {
            var arrayLibros = new Array();
            for (var [key, value] of lista) {
                if (value.categoria==tituloCompleto) {
                    arrayLibros.push(value);
                }
            }
            objCategoria.libros = arrayLibros;
            resp.status(200);
            resp.setHeader('Content-Type', 'application/json');
            resp.send(objCategoria);  
        }
    }
});

module.exports = router;