const db = require("../db/connection.js");

const fetchApi = () => {
  return fs.readFile(`./endpoints.json`).then((data) => {
    const endpoints = JSON.parse(data);
    return { endpoints };
  });
};

const fetchCategories = () => {
  return db.query("SELECT * FROM categories").then(({ rows }) => {
    return rows;
  });
};

const fetchCategory = (category) => {
  let queryString = "SELECT * FROM categories WHERE slug = $1";
  const queryValues = [category];

  return db.query(queryString, queryValues).then(({ rows }) => {
    if (!rows.length) {
      return Promise.reject({ status: 404, msg: "Category not found" });
    } else return rows[0];
  });
};

// const fetchReviews = () => {
//   return db
//     .query(
//       `
//     SELECT reviews.*, COUNT(comment_id) ::int AS comment_count
//     FROM reviews
//     LEFT JOIN comments ON reviews.review_id = comments.review_id
//     GROUP BY reviews.review_id
//     ORDER BY reviews.created_at DESC;

//     `
//     )
//     .then(({ rows }) => {
//       return rows;
//     });
// };

const fetchReviews = (
  sortBy = "created_at",
  orderBy = "DESC",
  category,
  limit = 10,
  page = 1
) => {
  const queryValues = [];

  const validOrderOptions = ["ASC", "DESC"];
  const validSortByProperties = [
    "owner",
    "title",
    "review_id",
    "category",
    "review_img_url",
    "created_at",
    "votes",
    "designer",
    "comment_count",
  ];

  let queryString = `SELECT reviews.*, 
  COUNT(comment_id) AS comment_count 
  FROM reviews 
  LEFT JOIN comments 
  ON comments.review_id = reviews.review_id `;

  if (category) {
    queryString += ` WHERE reviews.category = $1 `;
    queryValues.push(category);
  }

  queryString += `GROUP BY reviews.review_id ORDER BY `;

  if (validSortByProperties.includes(sortBy)) {
    queryString += `${sortBy} `;
  } else {
    return Promise.reject({
      status: 400,
      msg: "invalid sort_by",
    });
  }
  if (validOrderOptions.includes(orderBy)) {
    queryString += `${orderBy}`;
  } else {
    return Promise.reject({
      status: 400,
      msg: "Please select a valid order-by option",
    });
  }

  return db.query(queryString, queryValues).then(({ rows }) => {
    const total_count = rows.length;

    const offset = page * limit - limit;
    queryValues.push(limit);
    queryValues.push(offset);
    if (category) {
      queryString += ` LIMIT $2 OFFSET $3;`;
    } else {
      queryString += ` LIMIT $1 OFFSET $2;`;
    }

    return db.query(queryString, queryValues).then(({ rows }) => {
      const results = rows;
      limit = +limit;
      page = +page;
      let lowerRange = offset + 1;
      let higherRange = offset + limit;

      if (limit < 1) {
        return Promise.reject({
          status: 400,
          msg: "Limit must be more than 0",
        });
      }

      const remainder = total_count - (page - 1) * limit;

      const accNumofPages = Math.ceil(total_count / limit);

      // removed if statement to check if limit is more than TC

      let range = "";
      // make an if statement if last page or not
      if (page === accNumofPages) {
        //on last page
        if (remainder === 1) {
          range = `Showing result ${total_count} of ${total_count}`;
        } else if (remainder > 1) {
          range = `Showing results ${lowerRange} to ${total_count}`;
        }
      } else if (page > accNumofPages) {
        // searching for non-existent pg
        return Promise.reject({
          status: 404,
          msg: "Error 404 page not found!",
        });
      } else {
        //on any pg other than last
        range = `Showing results ${lowerRange} to ${higherRange}`;
      }

      return { total_count, page, range, results };
    });
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
};

const removeComment = (commentId) => {
  return db
    .query(
      `DELETE FROM comments WHERE comment_id = $1 RETURNING *;`,
      [commentId]
    )
    .then(({ rows }) => {
      const deletedCommentArr = rows;
      if (!deletedCommentArr.length) {
        return Promise.reject({ status: 404, msg: "invalid comment id" });
      }
    });
};

module.exports = {
  fetchCategories,
  fetchReviews,
  fetchReviewById,
  postComment,
  fetchReviewsComments,
  updateReview,
  fetchUsers,
  fetchCategory,
  fetchApi,
  removeComment,
};
