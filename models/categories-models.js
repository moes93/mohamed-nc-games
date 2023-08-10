const db = require("../db/connection");

exports.fetchCategories = () => {
  let queryStr = "SELECT * FROM categories";
  return db.query(queryStr).then((result) => {
    return result.rows;
  });
};

exports.fetchCategory = (category) => {
  let queryStr = "SELECT * FROM categories WHERE slug = $1";
  const queryParams = [category];
  return db.query(queryStr, queryParams).then((result) => {
    if (result.rowCount === 0) {
      return Promise.reject("category does not exist");
    } else {
      return result.rows[0];
    }
  });
};

exports.addCategory = (newCategory) => {
  const category = [newCategory.slug, newCategory.description];
  return db
    .query(
      `INSERT INTO categories
		(slug, description)
		VALUES
		($1, $2)
		RETURNING *`,
      category
    )
    .then(({ rows }) => {
      // console.log(rows[0]);
      return rows[0];
    });
};
