const sequelize = require("../db/index");
const { DataTypes } = require("sequelize");

const Exercise = sequelize.define("exercise", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    unique: true,
    autoIncrement: true,
  },
  title: { type: DataTypes.STRING, allowNull: false },
  content: { type: DataTypes.TEXT, allowNull: true },
  video: { type: DataTypes.STRING, allowNull: false },
});

module.exports = Exercise;
