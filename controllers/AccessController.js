const ApiError = require("../error/ApiError");
const { User, Password } = require("../models");
const jwt = require("jsonwebtoken");

const generateJwt = (id, role, pwd) => {
  return jwt.sign({ id, role, pwd }, process.env.SECRET_KEY, { expiresIn: "24h" });
};

class AccessController {
  async check(req, res, next) {
    const { chatID, password } = req.body;
    if (!chatID) {
      return next(
        ApiError.badRequest(
          "Користувача не ідентифіковано. Натисніть в чаті /start ще раз."
        )
      );
    }
    const candidate = await User.findOne({ where: { chatID } });
    if (!candidate) {
      return next(ApiError.badRequest("Користувач не існує"));
    }

    const user = await User.update({
      role: "USER",
    });

    const currentPassword = await Password.findOne();

    const token = generateJwt(user.id, user.role, password);
    return res.json({ token });
  }
}

module.exports = new AccessController();
