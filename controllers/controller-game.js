const {
  fetchCategories,
  fetchReviews,
  fetchReviewById,
  fetchReviewsComments,
  updateReview,
} = require("../models/model-game.js");

const getCategories = (req, res, next) => {
  fetchCategories().then((categories) => {
    res.status(200).send({ categories });
  });
};

const getReviews = (req, res, next) => {
  fetchReviews()
    .then((reviews) => {
      res.status(200).send({ reviews });
    })
    .catch((err) => {
      next(err);
    });
};

const getReviewById = (req, res, next) => {
  const reviewId = req.params.review_id;
  fetchReviewById(reviewId)
    .then((review) => {
      res.status(200).send({ review });
    })
    .catch((err) => {
      next(err);
    });
};

const getReviewsComments = (req, res, next) => {
  const { review_id } = req.params;
  fetchReviewsComments(review_id)
    .then((comments) => {
      res.status(200).send({ comments });
    })
    .catch((err) => {
      next(err);
    });
};

const patchReview = (req, res, next) => {
  const { review_id } = req.params;
  const  {inc_votes}  = req.body;
  console.log(inc_votes, "inc votes")
  updateReview(review_id, inc_votes)
    .then((review) => {
        console.log(review, "review")
      res.status(200).send({ review });
    })
    .catch((err) => {
      if (err) next(err);
    });
};

module.exports = {
  getCategories,
  getReviews,
  getReviewById,
  getReviewsComments,
  patchReview,
};
