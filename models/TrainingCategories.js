const sequelize = require("../db");
const Categories = require("./CategoriesModel");
const Training = require("./TrainingModel");

const TrainingCategories = sequelize.define(
  "training_categories",
  {},
  { timestamps: false }
);

Training.belongsToMany(Categories, { through: TrainingCategories });
Categories.belongsToMany(Training, { through: TrainingCategories });

module.exports = TrainingCategories;
