const { Op } = require("sequelize");
const uuid = require("uuid");
const path = require("path");
const { generateVideoPreview } = require("../utils/generateVideoPreview");
const ExerciseHelper = require("../utils/ExerciseHelper");
const {
  Exercise,
  ExerciseTypes,
  ExerciseCategories,
  Categories,
  Types,
} = require("../models");
const fs = require("fs");

class ExerciseController {
  async create(req, res) {
    try {
      const { title, content, types, categories } = req.body;
      const { video } = req.files;

      const vidMimeType = "mp4";
      const fileName = uuid.v4() + "." + vidMimeType;
      const videoPath = `${process.env.URL}:${process.env.PORT}/static/video/${fileName}`;
      video.mv(path.resolve(__dirname, "..", "static/video", fileName));

      await generateVideoPreview(fileName);

      const exercise = await Exercise.create({
        title,
        content,
        video: videoPath,
      });

      const helper = new ExerciseHelper(exercise.dataValues.id);

      if (types) helper.addTypes(types.split(","));
      if (categories) helper.addCategories(categories.split(","));

      res.status(201).json(exercise);
    } catch (error) {
      console.error("Error creating exercise:", error);
      res.status(500).json({ error: "Could not create exercise" });
    }
  }

  async edit(req, res) {
    const exerciseId = req.params.id;
    const { title, content, types, categories } = req.body;
    const video = req.files?.video;

    try {
      const exercise = await Exercise.findByPk(exerciseId);
      if (!exercise) {
        return res.status(404).json({ error: "Exercise not found" });
      }

      if (title) {
        exercise.title = title;
      }
      if (content) {
        exercise.content = content;
      }
      if (video) {
        const vidMimeType = "mp4";
        const fileName = uuid.v4() + "." + vidMimeType;
        const videoPath = `${process.env.URL}:${process.env.PORT}/static/video/${fileName}`;
        video.mv(path.resolve(__dirname, "..", "static/video", fileName));

        await generateVideoPreview(fileName);
        exercise.video = videoPath;
      }

      const helper = new ExerciseHelper(exerciseId);

      if (types) {
        const splittedTypes = types.split(",");

        helper.deleteOldTypes(splittedTypes);
        exercise.types = helper.addTypes(splittedTypes);
      }
      if (categories) {
        const splittedCategories = categories.split(",");

        helper.deleteOldCategories(splittedCategories);
        exercise.categories = helper.addCategories(splittedCategories);
      }

      await exercise.save();

      res.status(200).json(exercise);
    } catch (error) {
      console.error("Error editing exercise:", error);
      res.status(500).json({ error: "Could not edit exercise" });
    }
  }

  async getAll(req, res) {
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

      const exerciseList = await Promise.all(
        exercises.rows.map(async (item) => {
          const result = item.dataValues;

          const exerciseCategoriesQuery = await ExerciseCategories.findAll({
            where: { exerciseId: item.dataValues.id },
          });

          if (exerciseCategoriesQuery) {
            const categoryIds = exerciseCategoriesQuery.map(
              ({ dataValues: item }) => item.categoryId
            );
            const categoriesQuery = await Categories.findAll({
              where: { id: { [Op.in]: categoryIds } },
            });

            const categories = categoriesQuery.map(
              ({ dataValues: category }) => ({
                id: category.id,
                name: category.name,
              })
            );

            result.categories = categories;
          }

          const exerciseTypesQuery = await ExerciseTypes.findAll({
            where: { exerciseId: item.dataValues.id },
          });

          if (exerciseTypesQuery) {
            const typeIds = exerciseTypesQuery.map(
              ({ dataValues: item }) => item.typeId
            );

            const typesQuery = await Types.findAll({
              where: { id: { [Op.in]: typeIds } },
            });
            const types = typesQuery.map(({ dataValues: type }) => ({
              id: type.id,
              name: type.name,
            }));

            result.types = types;
          }

          if (item.video) {
            const videoName = item.video;

            const previewPath = videoName
              .replace("video", "preview")
              .replace(".mp4", ".jpg");

            result.preview = previewPath;
          }

          result.categories = result.categories ? result.categories : [];
          result.types = result.types ? result.types : [];

          return result;
        })
      );

      return res.status(200).json({
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

  async getOne(req, res) {
    const exerciseId = req.params.id;
    try {
      const exercise = await Exercise.findByPk(exerciseId);
      if (!exercise) {
        return res.status(404).json({ error: "Exercise not found" });
      }

      const result = exercise.dataValues;

      const exerciseCategoriesQuery = await ExerciseCategories.findAll({
        where: { exerciseId: exercise.dataValues.id },
      });
      if (exerciseCategoriesQuery) {
        const categoryIds = exerciseCategoriesQuery.map(
          ({ dataValues: category }) => category.categoryId
        );

        const categoriesQuery = await Categories.findAll({
          where: { id: { [Op.in]: categoryIds } },
        });
        const categories = categoriesQuery.map(
          ({ dataValues: category }) => category
        );
        result.categories = categories;
      }

      const exerciseTypesQuery = await ExerciseTypes.findAll({
        where: { exerciseId: exercise.dataValues.id },
      });
      if (exerciseTypesQuery) {
        const typeIds = exerciseTypesQuery.map(
          ({ dataValues: type }) => type.typeId
        );

        const typesQuery = await Types.findAll({
          where: { id: { [Op.in]: typeIds } },
        });
        const types = typesQuery.map(({ dataValues: type }) => type);

        result.types = types;
      }

      res.status(200).json(result);
    } catch (error) {
      console.error("Error getting exercise by id:", error);
      res.status(500).json({ error: "Could not fetch exercise" });
    }
  }

  async remove(req, res) {
    const exerciseId = req.params.id;
    try {
      const exercise = await Exercise.findByPk(exerciseId);
      if (!exercise) {
        return res.status(404).json({ error: "Exercise not found" });
      }
      const videoPath = exercise.dataValues.video
        .split("/")
        .filter(Boolean)
        .slice(2)
        .join("/");

      const previewPath = videoPath
        .replace("video", "preview")
        .replace(".mp4", ".jpg");

      fs.unlinkSync(path.resolve(__dirname, "..", videoPath));
      fs.unlinkSync(path.resolve(__dirname, "..", previewPath));

      await ExerciseTypes.destroy({ where: { exerciseId } });

      await ExerciseCategories.destroy({ where: { exerciseId } });

      await exercise.destroy();
      res.status(204).end();
    } catch (error) {
      console.error("Error removing exercise:", error);
      res.status(500).json({ error: "Could not remove exercise" });
    }
  }
}

module.exports = new ExerciseController();
