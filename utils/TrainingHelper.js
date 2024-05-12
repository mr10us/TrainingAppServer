const Categories = require("../models/CategoriesModel");
const TrainingCategories = require("../models/TrainingCategories");
const Types = require("../models/TypesModel");
const TrainingTypes = require("../models/TrainingTypes");
const Exercises = require("../models/ExerciseModel");
const TrainingExercise = require("../models/TrainingExercise");
const Training = require("../models/TrainingModel");

class TrainingHelper {
  constructor(training_id) {
    this.training_id = training_id;
  }

  async #checkForTraining() {
    const training = await Training.findByPk(this.training_id);
    if (!training) {
      throw new Error(`Training with ID ${this.training_id} not found.`);
    }
    return training;
  }

  async addExercises(exercises) {
 
    for (const exe of exercises) {
      const existingExercise = await Exercises.findOne({
        where: { id: exe.id },
      });

      if (!existingExercise) throw Error(`Training with ID ${exe.id} does not exist`);
    }
    const training = await this.#checkForTraining();

    for (const exe of exercises) {
      await TrainingExercise.create({
        trainingId: training.id,
        exerciseId: exe.id,
        ordinal_number: exe.ordinal_number,
      });
    }
  }

  async addCategories(categories) {

    for (const id of categories) {
      const existingCategory = await Categories.findOne({
        where: { id },
      });

      if (!existingCategory)
        category = await Categories.create({ id });
    }
    const training = await this.#checkForTraining();

    for (const id of categories) {
      await TrainingCategories.create({
        trainingId: training.id,
        categoryId: id,
      });
    }
  }

  async addTypes(types) {

    for (const id of types) {
      const existingType = await Types.findOne({
        where: { id },
      });

      if (!existingType) await Types.create({ id });
    }

    const training = await this.#checkForTraining();

    for (const id of types) {
      await TrainingTypes.create({
        training_id: training.id,
        type_id: id,
      });
    }
  }
}

module.exports = TrainingHelper;
