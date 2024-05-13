const Exercises = require("../models/ExerciseModel");
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

      if (!existingExercise)
        throw Error(`Training with ID ${exe.id} does not exist`);
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
}

module.exports = TrainingHelper;
