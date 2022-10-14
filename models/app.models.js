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

exports.selectReviews = (category) => {
    let queryStr = `
    SELECT reviews.* ,
    COUNT(comments.comment_id) ::INT AS comment_count
    FROM reviews
    LEFT JOIN comments ON comments.review_id = reviews.review_id`
    const queryValues = [];

    if (category) {
        queryStr += ` WHERE reviews.category = $1`
        queryValues.push(category)
    }

    queryStr += ` GROUP BY reviews.review_id ORDER BY created_at DESC;`

    const promises = [db.query(queryStr, queryValues)];

    if (category) {
        const secondQuery = db.query(`SELECT * FROM categories WHERE slug = $1`, queryValues);
        promises.push(secondQuery)
    }
    return Promise.all(promises).then((result) => {
        const reviews = result[0].rows;
        let categories
        if (category) {
            categories = result[1].rows;
        }
        if (reviews.length === 0) {
            if (categories.length === 0) {
               return Promise.reject({ status: 404, msg: 'Not found' })  
            }
            return reviews
        }
        return reviews
    })
}

exports.selectCommentsByReviewId = (review_id) => {

    const collectPromises = [db.query(`
    SELECT comments.* 
    FROM comments
    WHERE review_id = $1
    ORDER BY created_at DESC`, [review_id])]

    if (review_id) {
        const secondPromise = db.query(`SELECT * FROM reviews WHERE review_id = $1`, [review_id])
        collectPromises.push(secondPromise);
    }

    return Promise.all(collectPromises).then((result) => {
        const comment = result[0].rows;
        const reviewId = result[1].rows
        if (comment.length === 0) {
            if (reviewId.length === 0) {
                return Promise.reject({ status: 404, msg: 'Not found' })
            }
            return comment
        }
        return comment
    })
}

exports.insertCommentByReviewId = (review_id, newComment) => {
    const { username, body } = newComment;

    if (!username || !body) {
        return Promise.reject({ status: 400, msg: 'Invalid input' })
    }
    
    return db.query(`INSERT INTO comments (author, body, review_id) VALUES ($1, $2, $3) RETURNING *;`, [username, body, review_id]).then(({ rows: [comment]}) => {
        return comment
    })
}
