const {
  fetchReviews,
  fetchReviewById,
  fetchReviewComments,
  addReviewComments,
  updateReview,
  addReview,
  countReviews,
  removeReviewById,
} = require("../models/reviews-models");
const { fetchCategory } = require("../models/categories-models");

exports.getReviews = (req, res, next) => {
  const { category, sort_by, order, limit, p } = req.query;
  const promises = [];

  const countReviewsPromise = countReviews(category);
  const fetchReviewsPromise = fetchReviews(category, sort_by, order, limit, p);
  promises.push(countReviewsPromise);
  promises.push(fetchReviewsPromise);

  if (category) {
    const checkCategoryPromise = fetchCategory(category);
    promises.push(checkCategoryPromise);
  }

  return Promise.all(promises)
    .then(([total_count, reviews]) => {
      res.status(200).send({ total_count, reviews });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getReviewById = (req, res, next) => {
  const { review_id } = req.params;
  fetchReviewById(review_id)
    .then((review) => {
      res.status(200).send({ review });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getReviewComments = (req, res, next) => {
  const { review_id } = req.params;
  const { limit, p } = req.query;
  const checkReviewPromise = fetchReviewById(review_id);
  const fetchReviewCommentsPromise = fetchReviewComments(review_id, limit, p);

  return Promise.all([fetchReviewCommentsPromise, checkReviewPromise])
    .then(([comments]) => {
      res.status(200).send({ comments });
    })
    .catch((err) => {
      next(err);
    });
};

exports.postReviewComments = (req, res, next) => {
  const { review_id } = req.params;
  const newComment = req.body;

  addReviewComments(review_id, newComment)
    .then((comment) => {
      res.status(201).send({ comment });
    })
    .catch((err) => {
      next(err);
    });
};

exports.patchReview = (req, res, next) => {
  const { review_id } = req.params;
  const newComment = req.body;

  fetchReviewById(review_id)
    .then(() => {
      return updateReview(review_id, newComment);
    })
    .then((review) => {
      res.status(200).send({ review });
    })
    .catch((err) => {
      next(err);
    });
};

exports.postReview = (req, res, next) => {
  const newReview = req.body;

  addReview(newReview)
    .then((review) => {
      res.status(201).send({ review });
    })
    .catch((err) => {
      next(err);
    });
};

exports.deleteReviewById = (req, res, next) => {
  const { review_id } = req.params;
  removeReviewById(review_id)
    .then(() => {
      res.status(204).send();
    })
    .catch((err) => {
      next(err);
    });
};
