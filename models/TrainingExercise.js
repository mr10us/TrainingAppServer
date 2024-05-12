const { DataTypes } = require("sequelize");
const sequelize = require("../db");
const Exercise = require("./ExerciseModel");
const Training = require("./TrainingModel");

const TrainingExercise = sequelize.define(
  "training_exercise",
  { ordinal_number: { type: DataTypes.INTEGER, allowNull: true } },
  { timestamps: false }
);

Training.belongsToMany(Exercise, { through: TrainingExercise });
Exercise.belongsToMany(Training, { through: TrainingExercise });
