const sequelize = require("./db/index")
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
  role: { type: DataTypes.STRING, defaultValue: "USER" },
});

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

const Categories = sequelize.define("categories", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    unique: true,
    autoIncrement: true,
  },
  name: { type: DataTypes.STRING, allowNull: false, unique: true },
});

const Types = sequelize.define("types", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    unique: true,
    autoIncrement: true,
  },
  name: { type: DataTypes.STRING, allowNull: false, unique: true },
});

const ExerciseCategories = sequelize.define(
  "exercise_categories",
  {},
  { timestamps: false }
);

const ExerciseTypes = sequelize.define(
  "exercise_types",
  {},
  { timestamps: false }
);

const Reviews = sequelize.define("reviews", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    unique: true,
    autoIncrement: true,
  },
  rating: { type: DataTypes.FLOAT, allowNull: true },
  review: { type: DataTypes.TEXT, allowNull: true },
});

const Training = sequelize.define("training", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    unique: true,
    autoIncrement: true,
  },
  level: { type: DataTypes.INTEGER, allowNull: false },
  gender: { type: DataTypes.SMALLINT, allowNull: false },
  title: { type: DataTypes.STRING, allowNull: false },
  content: { type: DataTypes.TEXT, allowNull: false },
  image: { type: DataTypes.STRING, allowNull: false },
  exec_time: { type: DataTypes.TIME, allowNull: false },
  rating: { type: DataTypes.FLOAT, allowNull: true },
});

const TrainingExercise = sequelize.define(
  "training_exercise",
  { ordinal_number: { type: DataTypes.INTEGER, allowNull: true } },
  { timestamps: false }
);

User.hasMany(Reviews);

Training.hasMany(Reviews);

Training.belongsToMany(Exercise, { through: TrainingExercise });
Exercise.belongsToMany(Training, { through: TrainingExercise });

Reviews.belongsTo(User, { foreignKey: "userId" });
Reviews.belongsTo(Training, { foreignKey: "trainingId" });

Exercise.belongsToMany(Categories, { through: ExerciseCategories });
Categories.belongsToMany(Exercise, { through: ExerciseCategories });
Exercise.belongsToMany(Types, { through: ExerciseTypes });
Types.belongsToMany(Exercise, { through: ExerciseTypes });

module.exports = {
  User,
  Exercise,
  Types,
  Categories,
  ExerciseCategories,
  ExerciseTypes,
  Training,
  TrainingExercise,
  Reviews,
};
