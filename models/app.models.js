const db = require('../db/connection');

exports.selectCategories = () => {
    return db.query('SELECT * FROM categories').then(({ rows: categories }) => {
        return categories;
    })
}

exports.selectReviewById = (review_id) => {
    return db.query(`
    SELECT reviews.* ,
    COUNT(comments.comment_id) ::INT AS comment_count
    FROM reviews
    LEFT JOIN comments ON comments.review_id = reviews.review_id
    WHERE reviews.review_id = $1
    GROUP BY reviews.review_id;`, [review_id])
    .then(({ rows: [review] }) => {
        if (review === undefined) {
            return Promise.reject({ status: 404, msg: 'Review ID not found'})
        }
        return review
    })
}

exports.selectUsers = () => {
    return db.query('SELECT * FROM users').then(({ rows: users }) => {
        return users
    })
}