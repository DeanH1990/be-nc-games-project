const db = require('../db/connection');

exports.selectCategories = () => {
    return db.query('SELECT * FROM categories').then(({ rows: categories }) => {
        return categories;
    })
}

exports.selectReviewById = (review_id) => {
    return db.query(`
    SELECT * FROM reviews
    WHERE review_id = $1`, [review_id])
    .then(({ rows: [review] }) => {
        // console.log(review)
        if (review === undefined) {
            return Promise.reject({ status: 404, msg: 'Review ID not found'})
        }
        return review
    })
}