const { selectCategories, selectReviewById, selectUsers, patchReviewVotesById, selectCommentsByReviewId } = require("../models/app.models")



exports.getCategories = (req, res, next) => {
    selectCategories().then((categories) => {
        res.status(200).send({ categories })
    })
}

exports.getReviewById = (req, res, next) => {
    const { review_id } = req.params;
    selectReviewById(review_id).then((review) => {
        res.status(200).send({ review })
    })
    .catch((err) => {
        next(err)
    })
}

exports.getUsers = (req, res, next) => {
    selectUsers().then((users) => {
        res.status(200).send({ users })
    })
}

exports.updateReviewVotesById = (req, res, next) => {
    const { inc_votes } = req.body;
    const { review_id } = req.params;
    patchReviewVotesById(review_id, inc_votes).then((review) => {
        res.status(200).send({ review })
    })
    .catch((err) => {
        next(err)
    })
}

exports.getCommentsByReviewId = (req, res, next) => {
    const { review_id } = req.params;
    selectCommentsByReviewId(review_id).then((comments) => {
        res.status(200).send({ comments })
    })
    .catch((err) => {
        next(err)
    })

}