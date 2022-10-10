const { selectCategories } = require("../models/app.models")



exports.getCategories = (req, res, next) => {
    // console.log('in the controller')
    selectCategories().then((categories) => {
        res.status(200).send({ categories })
    })
}