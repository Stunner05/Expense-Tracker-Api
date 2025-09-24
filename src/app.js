const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const xss = require('xss')
const config = require('../config')
const multer = require("multer");
const upload = multer();
const routes = require('./routes/index')
const api = require('../api')
const app = express()

app.get("/favicon.ico", (req, res) => res.status(204).end());

app.get("/ping", (req, res) => {
	res.json({ message: "pong" });
});

app.get("/api/test", (req, res) => res.json({ ok: true }));


app.use(cors({
    // origin: config.frontrnd_uri,
    methods: ['GET', 'PATCH','PUT', 'POST', 'DELETE']
}))


app.use(helmet())
app.use(express.json({limit: '2000kb'}))

api.use("/api/v1", app);

// app.use(xss)
app.use((req, res, next) =>{
    console.log(req.path, req.method)
    next()
})
app.use('/', routes)
module.exports = app