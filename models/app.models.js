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
        return Promise.reject({ status: 400, msg: 'Wrong input'})
    }
    return db.query(`
    UPDATE reviews 
    SET votes = votes + $1
    WHERE review_id = $2
    RETURNING *;`, [inc_votes, review_id]
    ).then(({ rows: [review] }) => {
        if (review === undefined) {
            return Promise.reject({ status: 404, msg: 'Review ID not found'})
        }
        return review
    })
}

exports.selectReviews = (order = 'created_at DESC') => {
    const allowedOrders = ['created_at DESC', 'category'];

    if (!allowedOrders.includes(order)) {
        return Promise.reject({ status: 400, msg: 'Invalid order'});
    }

    return db.query(`
    SELECT reviews.* ,
    COUNT(comments.comment_id) ::INT AS comment_count
    FROM reviews
    LEFT JOIN comments ON comments.review_id = reviews.review_id
    GROUP BY reviews.review_id
    ORDER BY ${order};`).then(({ rows: reviews }) => {
        return reviews
    })
}