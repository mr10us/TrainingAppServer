const { Categories } = require("../models");
const { Op } = require("sequelize");

class CategoryController {
  async create(req, res) {
    try {
      const { name } = req.body;
      const category = await Categories.create({ name });
      res.status(201).json(category);
    } catch (error) {
      console.error("Error creating category:", error);
      res.status(500).json({ error: "Could not create category" });
    }
  }

  async edit(req, res) {
    const categoryId = req.params.id;
    const { name } = req.body;

    try {
      const category = await Categories.findByPk(categoryId);
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

  async getAll(req, res) {
    const {
      page = 1,
      limit = 10,
      sortBy = "id",
      sortOrder = "ASC",
      filterByName = "",
    } = req.query;
    const offset = (page - 1) * limit;

    try {
      const whereClause = {
        name: { [Op.like]: `%${filterByName}%` },
      };

      const orderClause = [[sortBy, sortOrder]];

      if (sortBy.includes("name")) {
        const [order] = sortBy.split("name").filter(Boolean);

        orderClause[0] = ["name", order === "-" ? "DESC" : "ASC"];
      }

      const categories = await Categories.findAndCountAll({
        where: whereClause,
        order: orderClause,
        limit: parseInt(limit, 10),
        offset: parseInt(offset, 10),
      });

      const totalPages = Math.ceil(categories.count / limit);

      return res.status(200).json({
        totalPages,
        currentPage: parseInt(page, 10),
        totalCount: categories.count,
        categories: categories.rows,
      });
    } catch (error) {
      console.error("Error getting categories:", error);
      res.status(500).json({ error: "Could not fetch categories" });
    }
  }

  async getOne(req, res) {
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

  async remove(req, res) {
    const categoryId = req.params.id;
    try {
      const category = await Categories.findByPk(categoryId);
      if (!category) {
        return res.status(404).json({ error: "Category not found" });
      }

      await category.destroy();
      res.status(204).end();
    } catch (error) {
      console.error("Error removing category:", error);
      res.status(500).json({ error: "Could not remove category" });
    }
  }
}

module.exports = new CategoryController();
