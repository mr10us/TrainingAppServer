const { Types } = require("../models");
const { Op } = require("sequelize");

class TypeController {
  async create(req, res) {
    try {
      const { name } = req.body;
      const type = await Types.create({ name });
      res.status(201).json(type);
    } catch (error) {
      console.error("Error creating type:", error);
      res.status(500).json({ error: "Could not create type" });
    }
  }

  async edit(req, res) {
    const typeId = req.params.id;
    const { name } = req.body;

    try {
      const type = await Types.findByPk(typeId);
      if (!type) {
        return res.status(404).json({ error: "Type not found" });
      }

      await type.update({ name });
      res.status(200).json(type);
    } catch (error) {
      console.error("Error editing type:", error);
      res.status(500).json({ error: "Could not edit type" });
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

      const types = await Types.findAndCountAll({
        where: whereClause,
        order: orderClause,
        limit: parseInt(limit, 10),
        offset: parseInt(offset, 10),
      });

      const totalPages = Math.ceil(types.count / limit);

      return res.status(200).json({
        totalPages,
        currentPage: parseInt(page, 10),
        totalCount: types.count,
        types: types.rows,
      });
    } catch (error) {
      console.error("Error getting types:", error);
      res.status(500).json({ error: "Could not fetch types" });
    }
  }

  async getOne(req, res) {
    const typeId = req.params.id;
    try {
      const type = await Types.findByPk(typeId);
      if (!type) {
        return res.status(404).json({ error: "Type not found" });
      }
      res.status(200).json(type);
    } catch (error) {
      console.error("Error getting type by id:", error);
      res.status(500).json({ error: "Could not fetch type" });
    }
  }

  async remove(req, res) {
    const typeId = req.params.id;
    try {
      const type = await Types.findByPk(typeId);
      if (!type) {
        return res.status(404).json({ error: "Type not found" });
      }

      await type.destroy();
      res.status(204).end();
    } catch (error) {
      console.error("Error removing type:", error);
      res.status(500).json({ error: "Could not remove type" });
    }
  }
}

module.exports = new TypeController();
