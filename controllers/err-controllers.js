const handleIncorrectEndpointErrors = (req, res, next) => {
  res.status(404).send({ msg: "incorrect endpoint" });
};

const handlePSQL400Erros = (err, req, res, next) => {
  if (err === "ID must be a number") {
    res.status(400).send({ msg: err });
  } else if (err.msg === "Category not found") {
    res.status(404).send({ msg: "Please select a valid category!" });
  } else if (err.msg === "invalid comment id") {
    res.status(404).send(err);
  } else if (err.code == "22P02"){
    res.status(400).send({msg:"Bad request"});

  } else if (err.msg === "invalid sort_by") {
    res.status(400).send({ msg: "Please select a valid sort-by option!" });
  } else if (err.msg === "mo was not found in column username") {
    res.status(404).send(err);
  } else {
    next(err);
  }
};

// const handleSQLErrors = (error, request, response, next) => {
//   if (error.code === "22P02" || error.code === "23502") {
//     response.status(400).send({ msg: "Bad request" });
//   } else if (error.code === "23503") {
//     response.status(404).send({ msg: "Not found" });
//   } else if (error.code === "2201W") {
//     response.status(400).send({ msg: "Limit provided is invalid" });
//   }
// };

const handleCustomErrors = (err, req, res, next) => {
  if (err.msg === "No review found") {
    res.status(err.status).send(err);
  } else if (err.msg === "Username Not Found") {
    res.status(err.status).send(err);
  } else if (err.msg === "No comment related") {
    res.status(err.status).send(err);
  } else {
    next(err);
  }
};

const handle500Errors = (err, req, res, next) => {
  if (err.status === 500) {
    res.status(500).send({ msg: "Server Error" });
  } else {
    next(err);
  }
};

module.exports = {
  handle500Errors,
  handleCustomErrors,
  handlePSQL400Erros,
  handleIncorrectEndpointErrors,
};
