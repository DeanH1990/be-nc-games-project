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

exports.selectCommentsByReviewId = (review_id) => {
    return db.query(`
    SELECT comments.* 
    FROM comments
    WHERE review_id = $1
    ORDER BY created_at DESC`, [review_id]).then(({ rows: comments }) => {
        if (comments.length === 0) {
            return Promise.reject({ status: 404, msg: 'Not found'})
        }
        return comments
    })
}

