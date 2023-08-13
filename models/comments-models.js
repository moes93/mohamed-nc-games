const db = require("../db/connection");

exports.removeCommentById = (comment_id) => {
  let queryStr = "DELETE FROM comments WHERE comment_id = $1 RETURNING *";
  const queryParams = [comment_id];

  return db.query(queryStr, queryParams).then((result) => {
    if (result.rowCount === 0) {
      return Promise.reject("comment not existent");
    }
    return result.rowCount;
  });
};

exports.updateCommentById = (comment_id, newVote) => {
  const queryParams = [newVote.inc_votes, comment_id];
  let queryStr = `UPDATE comments
  SET 
  votes = votes + $1
  WHERE comment_id = $2
  RETURNING *;`;

  return db.query(queryStr, queryParams).then((result) => {
    if (result.rowCount === 0) {
      return Promise.reject("comment not existent");
    }
    return result.rows[0];
  });
};
