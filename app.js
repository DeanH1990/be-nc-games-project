const express = require('express');
const { getCategories } = require('./controllers/app.controllers');
const app = express();

app.use(express.json())

app.get('/api/categories', getCategories);


module.exports = app;