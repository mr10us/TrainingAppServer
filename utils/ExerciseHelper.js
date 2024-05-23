const {
  Exercise,
  ExerciseTypes,
  ExerciseCategories,
  Types,
  Categories,
} = require("../models");
const { Op } = require("sequelize");

class ExerciseHelper {
  constructor(exerciseID) {
    this.exerciseID = exerciseID;
  }

  async #checkForExercise() {
    const exercise = await Exercise.findByPk(this.exerciseID);
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
      const existingRelation = await ExerciseCategories.findOne({
        where: { categoryId: id, exerciseId: exercise.id },
      });
      if (!existingRelation)
        await ExerciseCategories.create({
          exerciseId: exercise.id,
          categoryId: id,
        });
    }

    const newCategories = await Categories.findAndCountAll({
      where: { id: { [Op.in]: categories } },
    });
    return newCategories.rows;
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
      const existingRelation = await ExerciseTypes.findOne({
        where: { typeId: id, exerciseId: exercise.id },
      });
      if (!existingRelation)
        await ExerciseTypes.create({
          exerciseId: exercise.id,
          typeId: id,
        });
    }
    const newTypes = await Types.findAndCountAll({
      where: { id: { [Op.in]: types } },
    });
    return newTypes.rows;
  }
  async deleteOldTypes(newTypes) {
    const exercise = await this.#checkForExercise();

    const oldTypes = await ExerciseTypes.findAll({
      where: { exerciseId: exercise.id },
    });

    const oldTypeIds = oldTypes.map((oldType) =>
      oldType.getDataValue("typeId")
    );

    const typesToDelete = oldTypeIds.filter(
      (oldTypeId) => !newTypes.includes(oldTypeId)
    );

    for (const typeId of typesToDelete) {
      await ExerciseTypes.destroy({
        where: { typeId, exerciseId: exercise.id },
      });
    }
  }

  async deleteOldCategories(newCategories) {
    const exercise = await this.#checkForExercise();

    const oldCategories = await ExerciseCategories.findAll({
      where: { exerciseId: exercise.id },
    });

    const oldCategoryIds = oldCategories.map((oldCategory) =>
      oldCategory.getDataValue("categoryId")
    );

    const categoriesToDelete = oldCategoryIds.filter(
      (oldCategoryId) => !newCategories.includes(oldCategoryId)
    );

    for (const categoryId of categoriesToDelete) {
      await ExerciseCategories.destroy({
        where: { categoryId, exerciseId: exercise.id },
      });
    }
  }
}

module.exports = ExerciseHelper;
