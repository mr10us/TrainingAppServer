const sequelize = require("../db");
const Types = require("./TypesModel");
const Training = require("./TrainingModel");

const TrainingTypes = sequelize.define(
  "training_types",
  {},
  { timestamps: false }
);

Training.belongsToMany(Types, { through: TrainingTypes });
Types.belongsToMany(Training, { through: TrainingTypes });

module.exports = TrainingTypes;
