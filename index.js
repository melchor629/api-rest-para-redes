//jshint esversion: 6
//jshint node: true
"use strict";
const express = require('express');
const bodyParser = require('body-parser');

const app = express();

const status_errors = [
    { m: "OK", e: 200 },
    { m: "Ya existe", e: 409 },
    { m: "No existe", e: 404 },
    { m: "No entiendo", e: 400 }
];

const db = require('./db.json');

app.use(express.static('files'));

const error = (code, msg, res) => {
    res.status(status_errors[code].e).send({
        codigo: code,
        mensaje: status_errors[code].m,
        descripcion: msg
    });
};

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

const api = express.Router()
.use(bodyParser.json())
.all((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
})

.get('/categorias', (req, res) => {
    let array = [];
    for(let cat in db) {
        array.push(cat);
    }

    res.send({categorias: array});
})

.post('/categorias', (req, res) => {
    req.body.nombre = req.body.nombre.toLowerCase();
    if(!req.body.nombre) {
        error(3, "Falta nombre", res);
    } else {
        if(db[req.body.nombre]) {
            error(1, "Ya existe categoria", res);
        } else {
            db[req.body.nombre] = [];
            res.send({ categoria: db[req.body.nombre], nombre: req.body.nombre });
        }
    }
})

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

.get('/:categoria', (req, res) => {
    if(db[req.params.categoria]) {
        let array = [];
        for(let k in db[req.params.categoria]) {
            array.push({ id: k, titulo: db[req.params.categoria][k].titulo });
        }
        res.send({ categoria: array, nombre: req.params.categoria });
    } else {
        error(2, "No existe categoria", res);
    }
})

.post('/:categoria', (req, res) => {
    if(!req.body.titulo) {
        error(3, "Falta título", res);
    } else if(!req.body.descripcion) {
        error(3, "Falta descripción", res);
    } else {
        if(db[req.params.categoria]) {
            if(req.body.prioridad && ['BAJA', 'NORMAL', 'ALTA'].indexOf(req.body.prioridad) === -1) {
                error(3, "Prioridad errónea", res);
            } else {
                let id = db[req.params.categoria].length;
                db[req.params.categoria].push({
                    id: id,
                    titulo: req.body.titulo,
                    descripcion: req.body.descripcion,
                    fecha: req.body.fecha || null,
                    ubicacion: req.body.ubicacion || null,
                    prioridad: req.body.prioridad || 'NORMAL'
                });
                res.send(db[req.params.categoria][id]);
            }
        } else {
            error(2, "No existe categoria", res);
        }
    }
})

.delete('/:categoria', (req, res) => {
    if(db[req.params.categoria]) {
        res.send({ resultado: delete db[req.params.categoria] });
    } else {
        error(2, "No existe categoría", res);
    }
})

.put('/:categoria', (req, res) => {
    if(db[req.params.categoria]) {
        error(1, "Categoría ya existe", res);
    } else {
        db[req.params.categoria] = [];
        res.send({ categoria: db[req.params.categoria], nombre: req.params.categoria });
    }
})

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

.get('/:categoria/:id', (req, res) => {
    if(db[req.params.categoria]) {
        let cat = db[req.params.categoria];
        if(cat[req.params.id]) {
            res.send(cat[req.params.id]);
        } else {
            error(2, "No existe tarea en la categoría", res);
        }
    } else {
        error(2, "No existe categoría", res);
    }
})

.put('/:categoria/:id', (req, res) => {
    if(req.body.prioridad && ['BAJA', 'NORMAL', 'ALTA'].indexOf(req.body.prioridad) === -1) {
        error(3, "Prioridad errónea", res);
    } else if(db[req.params.categoria]) {
        let cat = db[req.params.categoria];
        if(cat[req.params.id]) {
            let tarea = cat[req.params.id];
            tarea.titulo = req.body.titulo || tarea.titulo;
            tarea.descripcion = req.body.descripcion || tarea.descripcion;
            tarea.fecha = req.body.fecha || tarea.fecha;
            tarea.ubicacion = req.body.ubicacion || tarea.ubicacion;
            tarea.prioridad = req.body.prioridad || tarea.prioridad;
            res.send(cat[req.params.id]);
        } else {
            error(2, "No existe tarea en la categoría", res);
        }
    } else {
        error(2, "No existe categoría", res);
    }
})

.delete('/:categoria/:id', (req, res) => {
    if(db[req.params.categoria]) {
        let cat = db[req.params.categoria];
        if(cat[req.params.id]) {
            res.send({ resultado: delete cat[req.params.id] });
        } else {
            error(2, "No existe tarea en la categoría", res);
        }
    } else {
        error(2, "No existe categoría", res);
    }
})

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

.all('/teapot', (req, res) => {
    res.status(418).send({ "here you have your tea": '🍵' });
});

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

app.use('/api', api);

app.use((err, req, res, next) => {
    res.status(500).send(`Ha habido un error<br><pre>${err.stack}</pre>`);
});

app.listen(process.env.PORT || 80, () => {
    console.log('Servidor escuchando en el puerto ' + (process.env.PORT || 80));
});
