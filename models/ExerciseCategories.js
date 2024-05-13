const sequelize = require("../db");
const Categories = require("./CategoriesModel");
const Exercise = require("./ExerciseModel");

const ExerciseCategories = sequelize.define(
  "exercise_categories",
  {},
  { timestamps: false }
);

Exercise.belongsToMany(Categories, { through: ExerciseCategories });
Categories.belongsToMany(Exercise, { through: ExerciseCategories });

module.exports = ExerciseCategories;
