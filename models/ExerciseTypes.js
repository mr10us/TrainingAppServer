const sequelize = require("../db");
const Types = require("./TypesModel");
const Exercise = require("./ExerciseModel");

const ExerciseTypes = sequelize.define(
  "exercise_types",
  {},
  { timestamps: false }
);

Exercise.belongsToMany(Types, { through: ExerciseTypes });
Types.belongsToMany(Exercise, { through: ExerciseTypes });

module.exports = ExerciseTypes;
