const db = require("../db/connection.js");

const fetchCategories = () => {
  return db.query("SELECT * FROM categories").then(({ rows }) => {
    return rows;
  });
};

const fetchReviews = () => {
  return db
    .query(
      `
    SELECT reviews.*, COUNT(comment_id) AS comment_count
    FROM reviews
    LEFT JOIN comments ON reviews.review_id = comments.review_id
    GROUP BY reviews.review_id
    ORDER BY reviews.created_at DESC;
    `
    )
    .then(({ rows }) => {
      // console.log(result,"<-----")
      return rows;
    });
};

const fetchReviewById = (review_id) => {

  if (isNaN(Number(review_id)) === true) {

    return Promise.reject("ID must be a number");
  } else {
    return db
      .query(
        `
        SELECT * FROM reviews 
        WHERE review_id = $1
        `,
        [review_id]
      )
      .then(({ rows }) => {
        if (rows[0] === undefined) {
            return Promise.reject({
                status: 404,
                msg: `No review found`,
            });
        } else {
          return rows[0];
        }
      });
  }
};

module.exports = { fetchCategories, fetchReviews, fetchReviewById };
