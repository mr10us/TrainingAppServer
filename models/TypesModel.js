const sequelize = require("../db/index");
const { DataTypes } = require("sequelize");

const Types = sequelize.define("types", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    unique: true,
    autoIncrement: true,
  },
  name: { type: DataTypes.STRING, allowNull: false, unique: true },
});

module.exports = Types;
