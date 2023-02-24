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
  if (isNaN(Number(review_id)) === true || isNaN(Number(inc_votes)) === true) {
    return Promise.reject("ID must be a number");
  } else {
    return db
      .query(
        `UPDATE reviews SET votes = votes + $2 WHERE review_id=$1 RETURNING *;`,
        [review_id, inc_votes]
      )
      .then(({ rows }) => {
        if (rows[0] === undefined) {
          return Promise.reject({
            status: 404,
            msg: `No review found`,
          });
        } else return rows[0];
      });
  }
};

const fetchUsers = () => {
	return db.query("SELECT * from users").then(({ rows: users }) => {
        return users;
	});
}

module.exports = {
  fetchCategories,
  fetchReviews,
  fetchReviewById,
  postComment,
  fetchReviewsComments,
  updateReview,
  fetchUsers,
};
