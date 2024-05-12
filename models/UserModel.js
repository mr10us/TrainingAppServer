const sequelize = require("../db/index");
const { DataTypes } = require("sequelize");

const User = sequelize.define("user", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    unique: true,
    autoIncrement: true,
  },
  chatID: { type: DataTypes.INTEGER, unique: true },
  username: { type: DataTypes.STRING, allowNull: true },
  gender: { type: DataTypes.SMALLINT, allowNull: true },
  role: {type: DataTypes.STRING, defaultValue: "USER"},
});

module.exports = User;