const ApiError = require("../error/ApiError");
const User = require("../models/UserModel");
const jwt = require("jsonwebtoken");

const generateJwt = (id, role) => {
  return jwt.sign({ id, role }, process.env.SECRET_KEY, { expiresIn: "24h" });
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
    const { chatID } = req.body;
    console.log(req.body)
    
    const user = await User.findOne({ where: { chatID } });
    if (!user) {
      return next(ApiError.internal("Користувача не знайдено"));
    }

    const token = generateJwt(user.id, user.role);

    return res.json({ user, token });
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
