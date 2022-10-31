const express = require('express');
const { getApi, getCategories, getReviewById, getUsers, updateReviewVotesById, getReviews, getCommentsByReviewId, createCommentByReviewId, removeCommentById } = require('./controllers/app.controllers');
const cors = require('cors');

const app = express();
app.use(cors());

app.use(express.json());

app.get('/api', getApi);
app.get('/api/categories', getCategories);
app.get('/api/reviews/:review_id', getReviewById);
app.get('/api/users', getUsers);
app.get('/api/reviews', getReviews);
app.get('/api/reviews/:review_id/comments', getCommentsByReviewId);

app.patch('/api/reviews/:review_id', updateReviewVotesById);

app.post('/api/reviews/:review_id/comments', createCommentByReviewId)

app.delete('/api/comments/:comment_id', removeCommentById)

app.all('*', (req, res) => {
    res.status(404).send({ msg: 'Route not found'})
})

app.use((err, req, res, next) => {
    if (err.code === '22P02') {
        res.status(400).send({ msg: 'Invalid ID type'})
    } else if (err.code === '23503') {
        res.status(404).send({ msg: 'Not found'})
    } else {
        next(err)
    }
    
})

app.use((err, req, res, next) => {
    if (err.status) {
        res.status(err.status).send({ msg: err.msg })
    } else {
        next(err)
    }
})

app.use((err, req, res, next) => {
    res.status(500).send({ msg: 'Internal server error'})
})


module.exports = app;