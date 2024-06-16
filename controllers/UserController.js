const ApiError = require("../error/ApiError");
const { User, Password } = require("../models");
const jwt = require("jsonwebtoken");

const generateJwt = (id, role, password) => {
  return jwt.sign({ id, role, password }, process.env.SECRET_KEY, {
    expiresIn: "24h",
  });
};

class UserController {
  async registration(req, res, next) {
    const { chatID, username } = req.body;
    if (!chatID) {
      return next(
        ApiError.badRequest(
          "Застосунок не може здійснити регістрацію нового користувача"
        )
      );
    }
    const candidate = await User.findOne({ where: { chatID } });
    if (candidate) {
      return next(ApiError.badRequest("Користувач вже існує"));
    }
    const user = await User.create({
      chatID,
      username,
      role: "USER",
    });
    return res.json({ user });
  }

  async login(req, res, next) {
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

      if (candidate.dataValues.role !== "ADMIN") {
        const [numberOfAffectedRows, affectedRows] = await User.update(
          { role: "USER" },
          { where: { chatID }, returning: true }
        );

        if (numberOfAffectedRows === 0) {
          return next(
            ApiError.badRequest("Не вдалось оновити роль користувача")
          );
        }

        const user = affectedRows[0];

        const currentPasswords = await Password.findAll({
          order: [["createdAt", "DESC"]],
        });
        const { password: currentPassword } = currentPasswords.length
          ? currentPasswords[0]
          : null;

        if (currentPassword != password) {
          return next(ApiError.badRequest("Невірний пароль"));
        }

        const token = generateJwt(user.id, user.role, password);
        return res.json({ user, token });
      } else {
        const token = generateJwt(candidate.id, candidate.role, null);
        return res.json({ candidate, token });
      }

      return res.json({ token });
    } catch (error) {
      console.error("Error during access check:", error);
      return next(ApiError.internal("Внутрішня помилка сервера"));
    }
  }

  async checkPermission(req, res, next) {
    const token = req.headers.authorization.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    return res.json({ role: decoded.role });
  }
}

module.exports = new UserController();
