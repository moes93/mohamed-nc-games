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
    SELECT reviews.*, COUNT(comment_id) ::int AS comment_count
    FROM reviews
    LEFT JOIN comments ON reviews.review_id = comments.review_id
    GROUP BY reviews.review_id
    ORDER BY reviews.created_at DESC;

    `
    )
    .then(({ rows }) => {
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

const fetchReviewsComments = (review_id) => {
  if (isNaN(Number(review_id)) === true) {
    return Promise.reject("ID must be a number");
  } else {
    const valid_id = db
      .query(`SELECT * from reviews WHERE review_id=$1`, [review_id])
      .then((result) => {
        if (result.rowCount === 0) {
          return Promise.reject({
            status: 404,
            msg: `No review found`,
          });
        } else return review_id;
      });
    const comment = db
      .query(
        `SELECT * from comments WHERE review_id=$1 ORDER BY created_at DESC`,
        [review_id]
      )
      .then((result) => {
        if (result.rowCount === 0) {
          return Promise.reject({
            status: 200,
            msg: `No comment related`,
          });
        } else return result.rows;
      });

    return Promise.all([valid_id, comment]).then((values) => {
      return values[1];
    });
  }
};

const updateReview = (review_id, inc_votes) => {
    if (isNaN(Number(review_id)) === true || isNaN(Number(inc_votes) ) === true) {
        return Promise.reject("ID must be a number");
      } else {
    return db
    .query(
        `UPDATE reviews SET votes = votes + $2 WHERE review_id=$1 RETURNING *;`,
        [review_id, inc_votes]
    )
    .then(({ rows }) => {
        console.log(rows)
        if (rows[0] === undefined) {
            return Promise.reject({
                status: 404,
                msg: `No review found`,
            });
        } else return rows[0];
    });
}}

module.exports = {
  fetchCategories,
  fetchReviews,
  fetchReviewById,
  fetchReviewsComments,
  updateReview
};
