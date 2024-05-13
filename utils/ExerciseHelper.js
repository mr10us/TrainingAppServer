const Categories = require("../models/CategoriesModel");
const Types = require("../models/TypesModel");
const ExerciseTypes = require("../models/ExerciseTypes");
const ExerciseCategories = require("../models/ExerciseCategories");
const Exercises = require("../models/ExerciseModel");

class ExerciseHelper {
  constructor(exerciseID) {
    this.exerciseID = exerciseID;
  }

  async #checkForExercise() {
    const exercise = await Exercises.findByPk(this.exerciseID);
    if (!exercise) {
      throw new Error(`Exercise with ID ${this.exerciseID} not found.`);
    }
    return exercise;
  }

  async addCategories(categories) {
    for (const id of categories) {
      const existingCategory = await Categories.findOne({
        where: { id },
      });

      if (!existingCategory)
        throw new Error(`Category with ID ${id} does not exist`);
    }
    const exercise = await this.#checkForExercise();

    for (const id of categories) {
      await ExerciseCategories.create({
        exerciseId: exercise.id,
        categoryId: id,
      });
    }
  }

  async addTypes(types) {
    for (const id of types) {
      const existingType = await Types.findOne({
        where: { id },
      });

      if (!existingType) throw new Error(`Type with ID ${id} does not exist`);
    }

    const exercise = await this.#checkForExercise();

    for (const id of types) {
      await ExerciseTypes.create({
        exerciseId: exercise.id,
        typeId: id,
      });
    }
  }
}

module.exports = ExerciseHelper;
