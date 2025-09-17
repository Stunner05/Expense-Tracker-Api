const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const xss = require('xss')
const config = require('../config')
const multer = require("multer");
const upload = multer();
const routes = require('./routes/index')

const app = express()
app.use(cors({
    // origin: config.frontrnd_uri,
    methods: ['GET', 'PATCH','PUT', 'POST', 'DELETE']
}))
app.use(helmet())
app.use(express.json({limit: '2000kb'}))
// app.use(xss)
app.use((req, res, next) =>{
    console.log(req.path, req.method)
    next()
})
app.use('/api', routes)
module.exports = app