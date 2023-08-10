const { fetchUsers, fetchUserByName } = require("../models/users-models");

exports.getUsers = (req, res, next) => {
  fetchUsers()
    .then((users) => {
      res.status(200).send({ users });
    })
    .catch((err) => {
      next(err);
    });
};

exports.getUserByName = (req, res, next) => {
  const { username } = req.params;

  fetchUserByName(username)
    .then((user) => {
      res.status(200).send({ user });
    })
    .catch((err) => {
      next(err);
    });
};
