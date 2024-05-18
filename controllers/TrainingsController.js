const Training = require("../models/TrainingModel");
const uuid = require("uuid");
const TrainingHelper = require("../utils/TrainingHelper");
const Categories = require("../models/CategoriesModel");
const Types = require("../models/TypesModel");
const ApiError = require("../error/ApiError");
const path = require("path");
const TrainingExercise = require("../models/TrainingExercise");
const { Op } = require("sequelize");
const Exercise = require("../models/ExerciseModel");
const fs = require("fs")

async function create(req, res, next) {
  try {
    let { level, gender, exercises, title, content, exec_time } = req.body;

    if (!exercises) throw Error("Can not create training with no exercises");

    const { image } = req.files;
    let fileName = uuid.v4() + ".jpg";
    const imagePath = `${process.env.URL}:${process.env.PORT}/static/image/${fileName}`;
    image.mv(path.resolve(__dirname, "..", "static/image", fileName));

    const result = {};

    if (exercises) {
      const training = await Training.create({
        level,
        gender,
        image: imagePath,
        title,
        content,
        exec_time,
      });

      const helper = new TrainingHelper(training.id);

      result.exercises = await helper.addExercises(JSON.parse(exercises));

      Object.entries(training.dataValues).map(
        ([key, value]) => (result[key] = value)
      );
    }

    return res.json(result).status(200);
  } catch (e) {
    next(ApiError.badRequest(e.message));
  }
}

async function edit(req, res, next) {
  try {
    let { level, gender, exercises, title, content, exec_time } = req.body;

    const trainingId = req.params.id;

    if (!exercises) throw Error("Can not create training with no exercises");

    const image = req.files?.image;

    const result = {};

    if (image) {
      let fileName = uuid.v4() + ".jpg";
      imagePath = `${process.env.URL}:${process.env.PORT}/static/image/${fileName}`;
      image.mv(path.resolve(__dirname, "..", "static/image", fileName));

      result.image = imagePath;
    }

    if (title) result.title = title;
    if (content) result.content = content;
    if (exec_time) result.exec_time = exec_time;
    if (level) result.level = level;
    if (gender) result.gender = gender;

    const helper = new TrainingHelper(trainingId);

    await helper.deleteOldExercises();

    result.exercises = await helper.addExercises(JSON.parse(exercises));

    await Training.update(result, {
      where: { id: trainingId },
      returning: true,
      plain: true,
    });

    const trainingExercises = await TrainingExercise.findAll({
      where: { trainingId },
    });

    const exerciseIds = trainingExercises.map(
      ({ dataValues: te }) => te.exerciseId
    );

    const ordinalNumbers = trainingExercises.reduce(
      (acc, { dataValues: te }) => {
        acc[te.exerciseId] = te.ordinal_number;
        return acc;
      },
      {}
    );

    const exercisesList = await Exercise.findAll({
      where: {
        id: exerciseIds,
      },
    });

    const exercisesWithOrdinal = exercisesList.map(
      ({ dataValues: exercise }) => ({
        ...exercise,
        ordinal_number: ordinalNumbers[exercise.id],
      })
    );

    const updatedTraining = await Training.findByPk(trainingId);

    updatedTraining.dataValues.exercises = exercisesWithOrdinal;

    return res.status(200).json(updatedTraining.dataValues);
  } catch (e) {
    next(ApiError.badRequest(e.message));
  }
}

async function getAll(req, res, next) {
  try {
    let { category, type, gender, level, limit, page } = req.query;

    page = page || 1;
    limit = limit || 10;
    let offset = page * limit - limit;

    let trainings;
    let filterClause = {
      include: [],
      where: {},
    };

    const categories = category ? category.split(",") : [];
    const types = type ? type.split(",") : [];
    const levels = level ? level.split(",") : [];

    // if (category) {
    //   filterClause.include.push({
    //     include: {
    //       model: Categories,
    //       through: TrainingCategories,
    //       where: {
    //         id: categories,
    //       },
    //     },
    //   });
    // }
    // if (type) {
    //   filterClause.include.push({
    //     include: {
    //       model: Types,
    //       through: TrainingTypes,
    //       where: {
    //         id: types,
    //       },
    //     },
    //   });
    // }
    if (gender) {
      filterClause.where.gender = gender;
    }
    if (level) {
      filterClause.where.level = levels;
    }

    trainings = await Training.findAndCountAll({
      ...filterClause,
      limit,
      offset,
    });

    const totalPages = Math.ceil(trainings.count / limit);

    return res.status(200).json({
      totalPages,
      currentPage: parseInt(page, 10),
      totalCount: trainings.count,
      trainings: trainings.rows,
    });
  } catch (e) {
    next(ApiError.badRequest(e.message));
  }
}

async function getOne(req, res, next) {
  try {
    let trainingId = req.params.id;

    if (!trainingId) throw Error("No training id provided");

    const training = await Training.findByPk(trainingId);

    if (!training)
      throw Error(`Training with id: ${trainingId} does not exist`);

    const result = training.dataValues;

    const trainingExercises = await TrainingExercise.findAll({
      where: { trainingId },
    });
    if (trainingExercises) {
      const exerciseIds = trainingExercises.map(
        ({ dataValues: te }) => te.exerciseId
      );

      const exercises = await Exercise.findAll({
        where: {
          id: exerciseIds,
        },
      });

      const ordinalMap = trainingExercises.reduce((map, { dataValues: te }) => {
        map[te.exerciseId] = te.ordinal_number;
        return map;
      }, {});

      const sortedExercises = exercises
        .map((exercise) => ({
          ...exercise.toJSON(),
          ordinal_number: ordinalMap[exercise.id],
        }))
        .sort((a, b) => {
          return ordinalMap[a.id] - ordinalMap[b.id];
        });

      result.exercises = sortedExercises;
    }
    return res.json(result);
  } catch (e) {
    next(ApiError.badRequest(e.message));
  }
}

async function remove(req, res, next) {
  try {
    const trainingId = req.params.id;

    const training = await Training.findByPk(trainingId);

    if (!training) {
      return res.status(404).json({ message: 'Training not found' });
    }

    await TrainingExercise.destroy({
      where: {
        trainingId: trainingId
      }
    });

    await Training.destroy({
      where: {
        id: trainingId
      }
    });

    const imagePath = training.dataValues.image.split("/").filter(Boolean).slice(2).join("/");

    fs.unlinkSync(path.resolve(__dirname, "..", imagePath));

    return res.status(200).json({ message: 'Training deleted successfully' });
  } catch (e) {
    next(ApiError.badRequest(e.message));
  }
}

module.exports = {
  create,
  edit,
  remove,
  getOne,
  getAll,
};
