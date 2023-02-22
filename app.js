const express = require("express");
const {getCategories, getReviews} = require("./controllers/controller-game.js")
const {handle500Errors,} = require("./controllers/err-controllers.js");

const app = express();

app.get("/api/categories", getCategories);
app.get("/api/reviews", getReviews);

// app.use(handle400Erros);

app.use(handle500Errors);



module.exports = app;
