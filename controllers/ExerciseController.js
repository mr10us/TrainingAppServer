const Exercise = require("../models/ExerciseModel");
const { Op } = require("sequelize");
const uuid = require("uuid");
const path = require("path");
const { generateVideoPreview } = require("../utils/generateVideoPreview");
const ExerciseHelper = require("../utils/ExerciseHelper");

async function create(req, res) {
  try {
    const { title, content, types, categories } = req.body;
    const { video } = req.files;

    const vidMimeType = video.mimetype.split("/")[1];
    let fileName = uuid.v4() + "." + vidMimeType;
    video.mv(path.resolve(__dirname, "..", "static/video", fileName));

    await generateVideoPreview(fileName);

    const exercise = await Exercise.create({ title, content, video: fileName });

    const helper = new ExerciseHelper(exercise.dataValues.id);

    if (types) helper.addTypes(types);
    if (categories) helper.addCategories(categories);

    res.status(201).json(exercise);
  } catch (error) {
    console.error("Error creating exercise:", error);
    res.status(500).json({ error: "Could not create exercise" });
  }
}

async function edit(req, res) {
  const categoryId = req.params.id;
  const { name } = req.body;

  try {
    const category = await Exercise.findByPk(categoryId);
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    await category.update({ name });
    res.status(200).json(category);
  } catch (error) {
    console.error("Error editing category:", error);
    res.status(500).json({ error: "Could not edit category" });
  }
}

async function getAll(req, res) {
  const {
    page = 1,
    limit = 10,
    sortBy = "id",
    sortOrder = "ASC",
    filterByTitle = "",
  } = req.query;
  const offset = (page - 1) * limit;

  try {
    const whereClause = {
      title: { [Op.like]: `%${filterByTitle}%` },
    };

    const orderClause = [[sortBy, sortOrder]];

    const exercises = await Exercise.findAndCountAll({
      where: whereClause,
      order: orderClause,
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
    });

    const totalPages = Math.ceil(exercises.count / limit);

    const exerciseList = exercises.rows.map((item) => {
      if (item.video) {
        const videoName = item.video.split(".")[0];

        previewPath = `${process.env.URL}:${process.env.PORT}/static/preview/${videoName}.jpg`;

        return {
          ...item.dataValues,
          preview: previewPath,
        };
      }
      return item.dataValues;
    });

    res.status(200).json({
      totalPages,
      currentPage: parseInt(page, 10),
      totalCount: exercises.count,
      exercises: exerciseList,
    });
  } catch (error) {
    console.error("Error getting exercises:", error);
    res.status(500).json({ error: "Could not fetch exercises" });
  }
}

async function getOne(req, res) {
  const categoryId = req.params.id;
  try {
    const category = await Categories.findByPk(categoryId);
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }
    res.status(200).json(category);
  } catch (error) {
    console.error("Error getting category by id:", error);
    res.status(500).json({ error: "Could not fetch category" });
  }
}

async function remove(req, res) {}

module.exports = {
  create,
  edit,
  getAll,
  getOne,
  remove,
};
