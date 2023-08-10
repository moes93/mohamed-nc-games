const db = require("../db/connection");

exports.fetchUsers = () => {
  let queryStr = "SELECT * FROM users";

  return db.query(queryStr).then((result) => {
    return result.rows;
  });
};

exports.fetchUserByName = (username) => {
  let queryStr = "SELECT * FROM users WHERE username = $1";
  const queryParams = [username];

  return db.query(queryStr, queryParams).then((result) => {
    if (result.rowCount === 0) {
      return Promise.reject("user does not exist");
    } else {
      return result.rows[0];
    }
  });
};
