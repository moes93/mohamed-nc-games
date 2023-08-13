exports.error404NoPath = (req, res, next) => {
  res.status(404).send({ msg: "Path not found" });
};

exports.customErrors = (err, req, res, next) => {
  if (err === "valid but not existent review_id") {
    res.status(404).send({ msg: err });
  } else if (err === "invalid query") {
    res.status(400).send({ msg: err });
  } else if (err === "comment not existent") {
    res.status(404).send({ msg: err });
  } else if (err === "user does not exist") {
    res.status(404).send({ msg: err });
  } else if (err === "review does not exist") {
    res.status(404).send({ msg: err });
  } else if (err === "category does not exist") {
    res.status(404).send({ msg: err });
  } else {
    next(err);
  }
};

exports.errorPSQL = (err, req, res, next) => {
  if (err.code === "22P02") {
    res.status(400).send({ msg: "bad request" });
  } else if (err.code === "23502") {
    res.status(400).send({ msg: "missing or wrong request keys" });
  } else if (err.code === "23505") {
    res.status(400).send({ msg: "slug already exists" });
  } else if (err.code === "23503") {
    res.status(404).send({ msg: "not found" });
  } else {
    next(err);
  }
};

exports.error500Status = (err, req, res, next) => {
  console.log(err);
  res.status(500).send({ msg: "500: Internal Server Error" });
};
