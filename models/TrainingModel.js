const sequelize = require("../db/index");
const { DataTypes } = require("sequelize");

const Training = sequelize.define("training", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    unique: true,
    autoIncrement: true,
  },
  level: { type: DataTypes.INTEGER, allowNull: false },
  gender: { type: DataTypes.SMALLINT, allowNull: false },
  title: {type: DataTypes.STRING, allowNull: false},
  content: {type: DataTypes.TEXT, allowNull: false},
  image: {type: DataTypes.STRING, allowNull: false},
  exec_time: {type: DataTypes.TIME, allowNull: false},
  rating: {type: DataTypes.FLOAT, allowNull: true}
});

module.exports = Training;
