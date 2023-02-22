const db = require("../db/connection.js");

const fetchCategories = () =>{
    return db.query("SELECT * FROM categories").then(({rows})=>{
        return rows;
    })
};

const fetchReviews = () =>{
    return db.query(`
    SELECT reviews.*, COUNT(comment_id) AS comment_count
    FROM reviews
    LEFT JOIN comments ON reviews.review_id = comments.review_id
    GROUP BY reviews.review_id
    ORDER BY reviews.created_at DESC;
    `)
    .then(({rows})=>{
        // console.log(result,"<-----")
        return rows
    });
};






module.exports = {fetchCategories, fetchReviews};