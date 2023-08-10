const cors = require("cors");
const express = require("express");
const app = express();
app.use(cors());
app.use(express.json());

const { getApi } = require("./controllers/api-controllers");
const {
  getCategories,
  postCategory,
} = require("./controllers/categories-controllers");
const {
  getReviews,
  getReviewById,
  getReviewComments,
  postReviewComments,
  patchReview,
  postReview,
  deleteReviewById,
} = require("./controllers/reviews-controllers");
const { getUsers, getUserByName } = require("./controllers/users-controllers");
const {
  deleteCommentById,
  patchCommentById,
} = require("./controllers/comments-controllers");
const {
  error500Status,
  customErrors,
  errorPSQL,
  error404NoPath,
} = require("./controllers/error-controllers");

app.get("/api", getApi);
app.get("/api/categories", getCategories);
app.get("/api/reviews", getReviews);
app.get("/api/reviews/:review_id", getReviewById);
app.get("/api/reviews/:review_id/comments", getReviewComments);
app.post("/api/reviews/:review_id/comments", postReviewComments);
app.patch("/api/reviews/:review_id", patchReview);
app.get("/api/users", getUsers);
app.delete("/api/comments/:comment_id", deleteCommentById);
app.get("/api/users/:username", getUserByName);
app.patch("/api/comments/:comment_id", patchCommentById);
app.post("/api/reviews", postReview);
app.post("/api/categories", postCategory);
app.delete("/api/reviews/:review_id", deleteReviewById);

app.use(error404NoPath);
app.use(errorPSQL);
app.use(customErrors);
app.use(error500Status);

module.exports = app;
