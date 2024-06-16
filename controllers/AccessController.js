const jwt = require("jsonwebtoken");
const ApiError = require("../error/ApiError");
const { User, Password } = require("../models");

class AccessController {
  async grant(req, res, next) {
    const { chatID, password } = req.body;
    if (!chatID) {
      return next(
        ApiError.badRequest(
          "Користувача не ідентифіковано. Натисніть в чаті /start ще раз."
        )
      );
    }

    try {
      const candidate = await User.findOne({ where: { chatID } });
      if (!candidate) {
        return next(ApiError.badRequest("Користувач не існує"));
      }

      const [numberOfAffectedRows, affectedRows] = await User.update(
        { role: "USER" },
        { where: { chatID }, returning: true }
      );

      if (numberOfAffectedRows === 0) {
        return next(ApiError.badRequest("Не вдалось оновити роль користувача"));
      }

      const user = affectedRows[0];

      const currentPasswords = await Password.findAll({
        order: [["createdAt", "DESC"]],
      });
      const currentPassword = currentPasswords.length
        ? currentPasswords[0]
        : null;

      if (!currentPassword || currentPassword.password !== password) {
        return next(ApiError.badRequest("Неправильний пароль"));
      }

      const token = generateJwt(user.id, user.role, password);

      return res.json({ token });
    } catch (error) {
      console.error("Error during access check:", error);
      return next(ApiError.internal("Внутрішня помилка сервера"));
    }
  }
}

function generateJwt(id, role, password) {
  return jwt.sign({ id, role, password }, process.env.SECRET_KEY, {
    expiresIn: "24h",
  });
}

module.exports = new AccessController();
