const db = require('../db/connection');

exports.selectCategories = () => {
    // console.log('in the model')
    return db.query('SELECT * FROM categories').then(({ rows: categories }) => {
        return categories;
    })
}