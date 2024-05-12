const User = require('../models/UserModel');

class UserService {
  async createUserIfNotExist(chatID, username, gender, role) {
    try {
      const existingUser = await User.findOne({ where: { chatID } });
      
      if (existingUser) {
        return existingUser;
      }

      const newUser = await User.create({
        chatID,
        username,
        gender,
        role,
      });

      return newUser;
    } catch (error) {
      console.error('Помилка при створенні користувача:', error);
      throw error;
    }
  }
}

module.exports = new UserService();
