const express = require("express");
const {getCategories, getReviews, getReviewById, getReviewsComments,postCommentByReviewId, patchReview, getUsers, getReviewsCategory} = require("./controllers/controller-game.js")

const app = express();
app.use(express.json())




const {handle500Errors, handlePSQL400Erros, handleCustomErrors, handleIncorrectEndpointErrors } = require("./controllers/err-controllers.js");



app.get("/api/categories", getCategories);
app.get("/api/reviews", getReviews);
app.get("/api/reviews/:review_id", getReviewById);
app.post("/api/reviews/:review_id/comments", postCommentByReviewId);
app.get("/api/reviews/:review_id/comments", getReviewsComments);
app.patch("/api/reviews/:review_id", patchReview)
app.get("/api/users", getUsers)
app.get("/api/reviews", getReviewsCategory)

app.use(handle500Errors);
app.use(handleCustomErrors);
app.use(handlePSQL400Erros);
app.use(handleIncorrectEndpointErrors);




module.exports = app;
