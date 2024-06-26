const {TrainingExercise, Training, Exercise} = require("../models");

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
    const training = await this.#checkForTraining();

    const addedExercises = [];
    for (const exe of exercises) {
      const existingExercise = await Exercise.findOne({
        where: { id: exe.id },
      });

      if (!existingExercise) {
        throw new Error(`Exercise with ID ${exe.id} does not exist`);
      }

      await TrainingExercise.create({
        trainingId: training.id,
        exerciseId: exe.id,
        ordinal_number: exe.ordinal_number,
      });

      addedExercises.push(existingExercise.dataValues);
    }

    return addedExercises;
  }

  async deleteOldExercises() {
    const training = await this.#checkForTraining();

    await TrainingExercise.destroy({
      where: { trainingId: training.id },
    });
  }
}

module.exports = TrainingHelper;
