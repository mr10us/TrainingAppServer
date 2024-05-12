const Training = require("../models/TrainingModel");
const uuid = require("uuid");
const TrainingHelper = require("../utils/TrainingHelper");
const TrainingCategories = require("../models/TrainingCategories");
const Categories = require("../models/CategoriesModel");
const Types = require("../models/TypesModel");
const TrainingTypes = require("../models/TrainingTypes");
const ApiError = require("../error/ApiError");
const axios = require("axios");
const path = require("path");

class TrainingsController {
  async create(req, res, next) {
    try {
      let {
        level,
        gender,
        type,
        category,
        exercise,
        title,
        content,
        exec_time,
        signal,
      } = req.body;

      const source = axios.CancelToken.source();
      signal.addEventListener("abort", () => {
        source.cancel("Request canceled by client");
      });

      if (!exercise) throw Error("Не можна створити тренування без вправ");

      const { image } = req.files;
      let fileName = uuid.v4() + ".jpg";
      image.mv(path.resolve(__dirname, "..", "static", fileName));
      const training = await Training.create({
        level,
        gender,
        image: fileName,
        title,
        content,
        exec_time,
      });
      const helper = new TrainingHelper(training.id);

      if (exercise) {
        await helper.addExercises(exercise);
      }

      if (category) {
        await helper.addCategories(category);
      }

      if (type) {
        await helper.addTypes(type);
      }

      return res.json({ message: "OK" }).status(200);
    } catch (e) {
      next(ApiError.badRequest(e.message));
    }
  }

  async getAll(req, res) {
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

    if (category) {
      filterClause.include.push({
        include: {
          model: Categories,
          through: TrainingCategories,
          where: {
            id: categories,
          },
        },
      });
    }
    if (type) {
      filterClause.include.push({
        include: {
          model: Types,
          through: TrainingTypes,
          where: {
            id: types,
          },
        },
      });
    }
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

    return res.json(trainings);
  }

  async getOne(req, res) {}
  async edit(req, res) {}
}

module.exports = new TrainingsController();
