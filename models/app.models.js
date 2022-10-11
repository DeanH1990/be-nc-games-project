const db = require('../db/connection');

exports.selectCategories = () => {
    return db.query('SELECT * FROM categories;').then(({ rows: categories }) => {
        return categories;
    })
}

exports.selectReviewById = (review_id) => {
    return db.query(`
    SELECT * FROM reviews
    WHERE review_id = $1;`, [review_id])
    .then(({ rows: [review] }) => {
        if (review === undefined) {
            return Promise.reject({ status: 404, msg: 'Review ID not found'})
        }
        return review
    })
}

exports.selectUsers = () => {
    return db.query('SELECT * FROM users;').then(({ rows: users }) => {
        return users
    })
}

exports.patchReviewVotesById = (review_id, inc_votes) => {
    if (typeof inc_votes !== 'number') {
        return Promise.reject({ status: 400, msg: 'Please input a number'})
    }
    return db.query(`
    UPDATE reviews 
    SET votes = votes + $1
    WHERE review_id = $2
    RETURNING *;`, [inc_votes, review_id]
    ).then(({ rows: [review] }) => {
        return review
    })
}