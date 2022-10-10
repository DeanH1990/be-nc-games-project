const express = require('express');
const { getCategories } = require('./controllers/app.controllers');
const app = express();



app.get('/api/categories', getCategories);


app.all('*', (req, res) => {
    res.status(404).send({ msg: 'Route not found'})
})


module.exports = app;