const handlePSQL400Erros = (err, req, res, next) => {
  //   if(err.code === "22P02"){
  if (err === "ID must be a number") {
    res.status(400).send({ msg: err });
  } else {
    next(err);
  }
};

const handleCustomErrors = (err, req, res, next) => {
  console.log(err);
  if (err.msg === "No review found") {
    res.status(err.status).send(err);
  } else if (err.msg === "Username Not Found") {
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

module.exports = { handle500Errors, handleCustomErrors, handlePSQL400Erros };
