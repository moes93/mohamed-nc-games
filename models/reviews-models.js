const db = require("../db/connection");

exports.fetchReviews = (
  category,
  sort_by = "created_at",
  order = "desc",
  limit = "10",
  p = "1"
) => {
  const validSortQuery = [
    "title",
    "designer",
    "owner",
    "review_img_url",
    "category",
    "created_at",
    "votes",
    "review_id",
    "comment_count",
  ];
  const validOrderQuery = ["asc", "desc"];

  const queryParams = [];
  let queryStr = `
    SELECT reviews.owner, reviews.title, reviews.review_id, reviews.category,
    reviews.review_img_url, reviews.created_at, reviews.votes, reviews.designer, COUNT(comments.review_id) AS comment_count
    FROM reviews
    LEFT JOIN comments ON reviews.review_id = comments.review_id
    `;

  if (category) {
    queryStr += ` WHERE category = $1`;
    queryParams.push(category);
  }
  queryStr += ` GROUP BY reviews.review_id ORDER BY `;

  if (validSortQuery.includes(sort_by)) {
    queryStr += `${sort_by}`;
  } else {
    return Promise.reject("invalid query");
  }

  if (validOrderQuery.includes(order)) {
    queryStr += ` ${order}`;
  } else {
    return Promise.reject("invalid query");
  }

  const regEx = /[^\0-9]/;
  if (limit.match(regEx) || p.match(regEx)) {
    return Promise.reject("invalid query");
  } else {
    queryStr += ` LIMIT ${limit} OFFSET ${(p - 1) * limit};`;
  }

  return db.query(queryStr, queryParams).then((result) => {
    // console.log(result.rows);
    return result.rows;
  });
};

exports.countReviews = (categories) => {
  let queryStr = `SELECT COUNT(*) FROM reviews`;
  const queryParam = [];

  if (categories) {
    queryStr += " WHERE category = $1";
    queryParam.push(categories);
  }

  return db.query(queryStr, queryParam).then(({ rows }) => {
    return +rows[0].count;
  });
};

exports.fetchReviewById = (review_id) => {
  let queryStr = `
    SELECT reviews.owner, reviews.title, reviews.review_id, reviews.category,
    reviews.review_img_url, reviews.created_at, reviews.votes, reviews.designer, reviews.review_body,
    COUNT(comments.review_id) AS comment_count
    FROM reviews
    LEFT JOIN comments ON reviews.review_id = comments.review_id
    WHERE reviews.review_id = $1
    GROUP BY reviews.review_id
  `;
  const queryParams = [review_id];

  return db.query(queryStr, queryParams).then((result) => {
    if (result.rowCount === 0) {
      return Promise.reject("valid but not existent review_id");
    } else {
      return result.rows[0];
    }
  });
};

exports.fetchReviewComments = (review_id, limit = "10", p = "1") => {
  let queryStr =
    "SELECT * FROM comments WHERE review_id = $1 ORDER BY created_at DESC";
  const queryParams = [review_id];

  const regEx = /[^\0-9]/;
  if (limit.match(regEx) || p.match(regEx)) {
    return Promise.reject("invalid query");
  } else {
    queryStr += ` LIMIT ${limit} OFFSET ${(p - 1) * limit};`;
  }

  return db.query(queryStr, queryParams).then((result) => {
    // console.log(result.rows);
    return result.rows;
  });
};

exports.addReviewComments = (review_id, newComment) => {
  const queryParams = [newComment.body, newComment.username, review_id];
  let queryStr = `INSERT INTO comments
  (body, author, review_id)
  VALUES
  ($1,$2,$3)
  RETURNING *;`;

  return db.query(queryStr, queryParams).then((result) => {
    return result.rows[0];
  });
};

exports.updateReview = (review_id, newComment) => {
  const queryParams = [newComment.inc_votes, review_id];
  let queryStr = `UPDATE reviews
  SET 
  votes = votes + $1
  WHERE review_id = $2
  RETURNING *;`;

  return db.query(queryStr, queryParams).then((result) => {
    return result.rows[0];
  });
};

exports.addReview = (newReview) => {
  const queryParams = [
    newReview.owner,
    newReview.title,
    newReview.review_body,
    newReview.designer,
    newReview.category,
  ];
  let queryStr = `INSERT INTO reviews
  (owner, title, review_body, designer, category)
  VALUES
  ($1,$2,$3,$4,$5)
  RETURNING *;`;

  if (newReview.review_img_url !== undefined) {
    queryParams.push(newReview.review_img_url);
    queryStr = `INSERT INTO reviews
    (owner, title, review_body, designer, category, review_img_url)
    VALUES
    ($1,$2,$3,$4,$5,$6)
    RETURNING *;`;
  }

  return db.query(queryStr, queryParams).then((result) => {
    return db
      .query(
        `SELECT owner, title, review_body, designer, category, reviews.review_id, reviews.votes, reviews.created_at, review_img_url,
        COUNT(reviews.review_id = comments.review_id) AS comment_count
        FROM reviews
        LEFT JOIN comments ON reviews.review_id = comments.review_id
        WHERE reviews.review_id = $1
        GROUP BY reviews.review_id`,
        [result.rows[0].review_id]
      )
      .then((result) => {
        return result.rows[0];
      });
  });
};

exports.removeReviewById = (review_id) => {
  let queryStr = "DELETE FROM reviews WHERE review_id = $1 RETURNING *";
  const queryParams = [review_id];

  return db.query(queryStr, queryParams).then((result) => {
    if (result.rowCount === 0) {
      return Promise.reject("review does not exist");
    }
    return result.rowCount;
  });
};
