const express = require("express");
const {getCategories, getReviews, getReviewById, getReviewsComments} = require("./controllers/controller-game.js")
const {handle500Errors, handlePSQL400Erros, handleCustomErrors } = require("./controllers/err-controllers.js");

const app = express();

app.get("/api/categories", getCategories);
app.get("/api/reviews", getReviews);
app.get("/api/reviews/:review_id", getReviewById);
app.get("/api/reviews/:review_id/comments", getReviewsComments);


app.use(handle500Errors);
app.use(handleCustomErrors);
app.use(handlePSQL400Erros);




module.exports = app;
