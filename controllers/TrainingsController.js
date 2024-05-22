const {
  Reviews,
  Categories,
  TrainingExercise,
  Exercise,
  ExerciseCategories,
  ExerciseTypes,
  Types,
  Training,
} = require("../models");
const uuid = require("uuid");
const TrainingHelper = require("../utils/TrainingHelper");
const ApiError = require("../error/ApiError");
const path = require("path");
const fs = require("fs");
const { calculateAverageRating } = require("../utils/calculateAverageRating");

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

    filterClause.include.push({
      model: Reviews,
      attributes: ["rating"],
    });

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

    const trainingsWithRating = trainings.rows.map((training) => {
      const ratingArray =
        training.reviews.length > 0
          ? training.reviews.map((review) => review.rating)
          : [];
      const rating = calculateAverageRating(ratingArray);

      return {
        ...training.toJSON(),

        rating,
      };
    });

    const totalPages = Math.ceil(trainings.count / limit);

    return res.status(200).json({
      totalPages,
      currentPage: parseInt(page, 10),
      totalCount: trainings.count,
      trainings: trainingsWithRating,
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

    const reviews = await Reviews.findAll({
      where: { trainingId: trainingId },
    });

    const ratingArray = reviews.map(({ dataValues: review }) => review.rating);
    const avgRating = calculateAverageRating(ratingArray);

    result.reviews = reviews;
    result.rating = avgRating;

    const trainingExercises = await TrainingExercise.findAll({
      where: { trainingId },
    });

    if (trainingExercises.length) {
      const exerciseIds = trainingExercises.map(
        ({ dataValues: te }) => te.exerciseId
      );

      const exercises = await Exercise.findAll({
        where: { id: exerciseIds },
      });

      const ordinalMap = trainingExercises.reduce((map, { dataValues: te }) => {
        map[te.exerciseId] = te.ordinal_number;
        return map;
      }, {});

      const exerciseCategories = await ExerciseCategories.findAll({
        where: { exerciseId: exerciseIds },
      });
      const exerciseTypes = await ExerciseTypes.findAll({
        where: { exerciseId: exerciseIds },
      });

      const categoryIds = [
        ...new Set(
          exerciseCategories.map(({ dataValues: ec }) => ec.categoryId)
        ),
      ];
      const typeIds = [
        ...new Set(exerciseTypes.map(({ dataValues: et }) => et.typeId)),
      ];

      const categories = await Categories.findAll({
        where: { id: categoryIds },
      });
      const types = await Types.findAll({
        where: { id: typeIds },
      });

      result.categories = categories;
      result.types = types;

      const sortedExercises = exercises
        .map((exercise) => {
          return {
            ...exercise.toJSON(),
            ordinal_number: ordinalMap[exercise.id],
          };
        })
        .sort((a, b) => ordinalMap[a.id] - ordinalMap[b.id]);

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
      return res.status(404).json({ message: "Training not found" });
    }

    await TrainingExercise.destroy({
      where: {
        trainingId: trainingId,
      },
    });

    await Training.destroy({
      where: {
        id: trainingId,
      },
    });

    const imagePath = training.dataValues.image
      .split("/")
      .filter(Boolean)
      .slice(2)
      .join("/");

    fs.unlinkSync(path.resolve(__dirname, "..", imagePath));

    return res.status(200).json({ message: "Training deleted successfully" });
  } catch (e) {
    next(ApiError.badRequest(e.message));
  }
}

async function addReview(req, res, next) {
  try {
    const { rating, review, trainingID, userID } = req.body;

    if (!trainingID || !userID) {
      throw ApiError.badRequest("Training ID and User ID are required");
    }

    const newReview = await Reviews.create({
      rating,
      review,
      trainingId: trainingID,
      userId: userID,
    });

    return res.status(200).json(newReview);
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
  addReview,
};
