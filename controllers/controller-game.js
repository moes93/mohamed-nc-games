const {fetchCategories, fetchReviews, fetchReviewById} = require("../models/model-game.js")


const getCategories =(req,res,next)=>{
    fetchCategories().then((categories)=>{
        res.status(200).send({categories})
        // console.log(categories)
    })
};

const getReviews = (req, res, next) =>{
    fetchReviews()
    .then((reviews)=>{
        // console.log(reviews,"<-----I am in controller")
        res.status(200).send({reviews})
    })
    .catch((err)=>{
        // console.log(err)
        next(err)
    })
}

const getReviewById = (req, res, next) =>{
    const reviewId = req.params.review_id
    fetchReviewById(reviewId)

    .then((review)=>{
		res.status(200).send({ review });
		})
	.catch((err) => {
		next(err);
	});
}

module.exports = {getCategories, getReviews, getReviewById}