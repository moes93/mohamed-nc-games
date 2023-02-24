const {
  fetchCategories,
  fetchReviews,
  fetchReviewById,
  postComment,
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

const postCommentByReviewId = (req, res, next) => {
  const reviewId = req.params.review_id;
  const comment = req.body;
postComment(reviewId, comment)
.then((result) => {
  res.status(201).send({"comment":result[0]});
})
.catch((err) => {
  next(err);
});
};

module.exports = {
  getCategories,
  getReviews,
  getReviewById,
  postCommentByReviewId,
};
