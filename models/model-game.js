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

const postComment = (review_id, comment) => {
    if (isNaN(Number(review_id)) === true) {
        return Promise.reject("ID must be a number");
      } else {
  const username = comment.username;
  const body = comment.body;
// console.log(body)
  if (!username || !body) {
    return Promise.reject({
      status: 400,
      msg: "username or body missing",
    });
  }
  const valid_username = db
    .query(`SELECT * from comments WHERE author=$1`, [username])
    .then(({ rows }) => {

      if (rows.length === 0) {
        return Promise.reject({
          status: 404,
          msg: `Username Not Found`,
        });
      } else return rows[0];
    });
  const insertedComment = db
    .query(
      `INSERT INTO comments(review_id, author, body) VALUES ($1, $2, $3) RETURNING *;`,
      [review_id, username, body]
    )
    .then(({ rows }) => {

      return rows;
    });
  return Promise.all([valid_username, insertedComment]).then((result) => {
    return result[1];
  });
};
};


module.exports = {
  fetchCategories,
  fetchReviews,
  fetchReviewById,
  postComment,
};
