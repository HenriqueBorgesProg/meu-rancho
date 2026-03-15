const { Animal, Weighing, DashboardCache } = require("../models");
const { Sequelize, Op } = require("sequelize");

async function calcularIndicadores() {
  const total_animals = await Animal.count({
    where: {
      status: "active",
    },
  });

  const animais = await Animal.findAll({
    where: {
      status: "active",
    },
  });

  let somaGmd = 0;
  let somaKg = 0;
  let pointer = 0;
  let avg_gmd = 0;
  let avg_weight_kg = 0;

  for (const animal of animais) {
    const ultimaPesagem = await Weighing.findOne({
      where: {
        animal_id: animal.id,
      },
      order: [["date", "DESC"]],
    });

    if (ultimaPesagem) {
      somaGmd += ultimaPesagem.gmd;
      somaKg += ultimaPesagem.weight_kg;
      pointer++;
    }
  }
  if (pointer != 0) {
    avg_gmd = somaGmd / pointer;
    avg_weight_kg = somaKg / pointer;
  }

  const breedDistribution = await Animal.findAll({
    attributes: [
      "breed",
      [Sequelize.fn("COUNT", Sequelize.col("breed")), "breed_qtd"],
    ],
    where: {
      status: "active",
    },
    group: ["breed"],
  });

  const breed_distribution = breedDistribution.reduce((acc, item) => {
    acc[item.breed] = parseInt(item.dataValues.breed_qtd);
    return acc;
  }, {});

  const categoryDistribution = await Animal.findAll({
    attributes: [
      "category",
      [Sequelize.fn("COUNT", Sequelize.col("category")), "category_qtd"],
    ],
    where: {
      status: "active",
    },
    group: ["category"],
  });

  const category_distribution = categoryDistribution.reduce((acc, item) => {
    acc[item.category] = parseInt(item.dataValues.category_qtd);
    return acc;
  }, {});

  const seiseMesesAtras = new Date();
  seiseMesesAtras.setMonth(seiseMesesAtras.getMonth() - 6);

  const weightHistoryRaw = await Weighing.findAll({
    attributes: [
      [Sequelize.fn("DATE_TRUNC", "month", Sequelize.col("date")), "month"],
      [Sequelize.fn("AVG", Sequelize.col("weight_kg")), "avg_weight"],
    ],
    where: { date: { [Op.gte]: seiseMesesAtras } },
    group: [Sequelize.fn("DATE_TRUNC", "month", Sequelize.col("date"))],
    order: [
      [Sequelize.fn("DATE_TRUNC", "month", Sequelize.col("date")), "ASC"],
    ],
  });

  const weight_history = weightHistoryRaw.map((item) => ({
    month: new Date(item.dataValues.month).toISOString().slice(0, 7),
    avg: parseFloat(parseFloat(item.dataValues.avg_weight).toFixed(2)),
  }));

  return {
    total_animals,
    avg_weight_kg,
    avg_gmd,
    breed_distribution,
    category_distribution,
    weight_history,
  };
}

module.exports = {
  calcularIndicadores,

  async show(req, res) {
    const dashboard = await DashboardCache.findByPk(1);

    if (!dashboard) {
      return res.status(404).json({ error: "Dashboard ainda não calculado" });
    }
    return res.status(200).json(dashboard);
  },

  async refresh(req, res) {
    const dados = await calcularIndicadores();

    await DashboardCache.upsert({
      id: 1,
      ...dados,
      calculated_at: new Date(),
    });

    const dadoAtualizado = await DashboardCache.findByPk(1);
    return res.status(200).json(dadoAtualizado);
  },
};
