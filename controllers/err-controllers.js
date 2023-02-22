

// const handle400Erros = (req, res, next) => {
//     res.status(404).send({ msg: "incorrect endpoint" });
//   };
  

const handle500Errors = (error, req, res, next) => {
    if (error.status === 500) {
      res.status(500).send({ msg: "Server Error" });
    } else {
      next(err);
    }
  };

  module.exports = {handle500Errors };