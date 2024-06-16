const jwt = require("jsonwebtoken");
const { Password } = require("../models");

module.exports = function () {
  return function (req, res, next) {
    if (req.method === "OPTIONS") {
      next();
    }
    try {
      const token = req.headers.authorization.split(" ")[1];
      if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const decoded = jwt.verify(token, process.env.SECRET_KEY);

      Password.findAll({
        order: [["createdAt", "DESC"]],
      }).then((currentPasswords) => {
        const currentPassword = currentPasswords.length
          ? currentPasswords[0]
          : null;

        if (decoded?.password != currentPassword.password) {
          return res.status(403).json({ message: "Forbidden" });
        } else next();
      });
    } catch (e) {
      console.log(e);
      if (e instanceof jwt.TokenExpiredError)
        return res.status(401).json({ message: e.message });
      res.status(401).json({ message: "Unauthorized" });
    }
  };
};
