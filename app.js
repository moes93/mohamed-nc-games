const express = require("express");
const {getCategories, getReviews, getReviewById, postCommentByReviewId} = require("./controllers/controller-game.js")
const {handle500Errors, handlePSQL400Erros, handleCustomErrors } = require("./controllers/err-controllers.js");

const app = express();

app.use(express.json())

app.get("/api/categories", getCategories);
app.get("/api/reviews", getReviews);
app.get("/api/reviews/:review_id", getReviewById);
app.post("/api/reviews/:review_id/comments", postCommentByReviewId);


app.use(handle500Errors);
app.use(handleCustomErrors);
app.use(handlePSQL400Erros);




module.exports = app;
