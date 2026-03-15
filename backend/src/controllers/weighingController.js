const { Weighing } = require("../models");
const { calcularGMD } = require("../services/gmdService");

module.exports = {
  async index(req, res) {
    const { id } = req.params;

    const pesagens = await Weighing.findAll({
      where: {
        animal_id: id,
      },
      order: [["date", "DESC"]],
    });
    return res.status(200).json(pesagens);
  },

  async store(req, res) {
    const { id } = req.params;
    const { weight_kg, date, notes } = req.body;

    if (!weight_kg) {
      return res.status(400).json({
        error: "Campos obrigatórios peso e data devem ser informados",
      });
    }

    if (!date) {
      return res.status(400).json({
        error: "Campos obrigatórios peso e data devem ser informados",
      });
    }

    const gmd = await calcularGMD(id, weight_kg, date);

    const pesagem = await Weighing.create({
      animal_id: id,
      weight_kg,
      date,
      gmd,
      notes,
    });

    return res.status(201).json(pesagem);
  },

  async destroy(req, res) {
    const { id } = req.params;

    const pesagem = await Weighing.findByPk(id);

    if (!pesagem) {
      return res.status(404).json({ error: "Animal não encontrado" });
    }

    await pesagem.destroy();
    res.status(204).send();
  },
};
