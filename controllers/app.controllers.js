const { selectCategories, selectReviewById } = require("../models/app.models")



exports.getCategories = (req, res, next) => {
    selectCategories().then((categories) => {
        res.status(200).send({ categories })
    })
}

exports.getReviewById = (req, res, next) => {
    const { review_id } = req.params;
    selectReviewById(review_id).then((review) => {
        res.status(200).send({review})
    })
    .catch((err) => {
        next(err)
    })
}