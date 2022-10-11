const express = require('express');
const { getCategories, getReviewById, getUsers } = require('./controllers/app.controllers');
const app = express();



app.get('/api/categories', getCategories);
app.get('/api/reviews/:review_id', getReviewById);
app.get('/api/users', getUsers);


app.all('*', (req, res) => {
    res.status(404).send({ msg: 'Route not found'})
})

app.use((err, req, res, next) => {
    if (err.code === '22P02') {
        res.status(400).send({ msg: 'Invalid ID type'})
    } else {
        next(err)
    }
})

app.use((err, req, res, next) => {
    if (err.status) {
        res.status(err.status).send({ msg: err.msg })
    }
})


module.exports = app;