const { Op } = require("sequelize");
const { Animal, Weighing } = require("../models");

class AnimalController {
  async index(request, response) {
    const { status, breed, category, search } = request.query;

    const where = {};

    if (status) {
      where.status = status;
    }

    if (breed) {
      where.breed = breed;
    }

    if (category) {
      where.category = category;
    }

    if (search) {
      where.tag_number = { [Op.iLike]: `%${search}%` };
    }

    const animals = await Animal.findAll({
      where,
      order: [["tag_number", "ASC"]],
    });
    response.status(200).json(animals);
  }

  async show(request, response) {
    const { id } = request.params;

    const animal = await Animal.findByPk(id, {
      include: [
        {
          model: Weighing,
          as: "weighings",
          attributes: ["animal_id", "weight_kg", "date", "gmd", "notes"],
        },
      ],
      order: [[{ model: Weighing, as: "weighings" }, "date", "DESC"]],
    });

    if (!animal) {
      return response.status(404).json({ error: "Animal não encontrado" });
    }

    response.status(200).json(animal);
  }

  async store(request, response) {
    const { tag_number, breed, category, sex, entry_weight_kg, entry_date } =
      request.body;

    const requiredFields = [
      "tag_number",
      "breed",
      "category",
      "sex",
      "entry_weight_kg",
      "entry_date",
    ];
    const values = [
      tag_number,
      breed,
      category,
      sex,
      entry_weight_kg,
      entry_date,
    ];

    const isMissingField = values.some((value) => !value);

    if (isMissingField) {
      return response.status(400).json({
        error: `Campos obrigatórios: ${requiredFields.join(", ")}`,
      });
    }

    const animal = await Animal.create(request.body);

    return response.status(201).json(animal);
  }

  async update(request, response) {
    const { id } = request.params;

    const animal = await Animal.findByPk(id);
    if (!animal) {
      return response.status(404).json({ error: "Animal não encontrado" });
    }

    await animal.update(request.body);
    return response.status(200).json(animal);
  }

  async destroy(request, response) {
    const { id } = request.params;

    const animal = await Animal.findByPk(id);

    if (!animal) {
      return response.status(404).json({ error: "Animal não encontrado" });
    }

    await animal.destroy();

    return response.status(204).send();
  }
}

module.exports = new AnimalController();
