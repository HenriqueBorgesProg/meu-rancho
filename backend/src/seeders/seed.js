const sequelize = require("../config/database");
const { Animal, Weighing, DashboardCache } = require("../models");

// Helper: random item from array
function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Helper: random number between min and max (inclusive)
function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Helper: add days to a date
function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

// Helper: format date as YYYY-MM-DD
function fmt(date) {
  return date.toISOString().split("T")[0];
}

const BREEDS = [
  "Nelore",
  "Nelore",
  "Nelore",
  "Angus",
  "Angus",
  "Cruzado",
  "Cruzado",
  "Tabapuã",
  "Hereford",
  "Senepol",
];

const MALE_CATEGORIES = ["bezerro", "garrote", "novilho", "boi", "touro"];
const FEMALE_CATEGORIES = ["bezerra", "novilha", "vaca"];

const MALE_NAMES = [
  "Trovão",
  "Relâmpago",
  "Bravo",
  "Guerreiro",
  "Sultão",
  "Tornado",
  "Faísca",
  "Cometa",
  "Valente",
  "Imperador",
  "Gladiador",
  "Centauro",
  "Vulcão",
  "Netuno",
  null,
  null,
  null,
  null,
  null,
  null,
];
const FEMALE_NAMES = [
  "Estrela",
  "Mimosa",
  "Boneca",
  "Princesa",
  "Jabuticaba",
  "Flor",
  "Pérola",
  "Serena",
  "Aurora",
  "Luna",
  null,
  null,
  null,
  null,
  null,
];

// Weight ranges by category (entry weight in kg)
const WEIGHT_RANGES = {
  bezerro: [150, 200],
  bezerra: [140, 190],
  garrote: [200, 280],
  novilho: [280, 380],
  novilha: [250, 340],
  boi: [380, 500],
  vaca: [350, 480],
  touro: [450, 600],
};

async function seed() {
  try {
    await sequelize.sync({ force: true });
    console.log("Tabelas criadas com sucesso!\n");

    const animals = [];

    for (let i = 1; i <= 30; i++) {
      const sex = Math.random() < 0.6 ? "M" : "F";
      const category =
        sex === "M" ? pick(MALE_CATEGORIES) : pick(FEMALE_CATEGORIES);
      const name = sex === "M" ? pick(MALE_NAMES) : pick(FEMALE_NAMES);
      const breed = pick(BREEDS);
      const [minW, maxW] = WEIGHT_RANGES[category];
      const entryWeight = rand(minW, maxW);

      // Entry date: between 6 and 14 months ago
      const daysAgo = rand(180, 420);
      const entryDate = addDays(new Date(), -daysAgo);

      // Birth date: 6 to 24 months before entry
      const birthOffset = rand(180, 720);
      const birthDate = addDays(entryDate, -birthOffset);

      // Status: mostly active, a few sold/dead
      let status = "active";
      if (i === 28) status = "sold";
      if (i === 29) status = "dead";
      if (i === 30) status = "sold";

      const animal = await Animal.create({
        tag_number: String(i).padStart(3, "0"),
        name,
        breed,
        category,
        sex,
        birth_date: fmt(birthDate),
        entry_weight_kg: entryWeight,
        entry_date: fmt(entryDate),
        status,
      });

      animals.push(animal);
      console.log(
        `Animal criado: Brinco ${animal.tag_number} | ${animal.breed} | ${animal.category} | ${entryWeight}kg`,
      );
    }

    console.log("\nCriando pesagens...\n");

    for (const animal of animals) {
      if (animal.status === "dead") continue;

      const entryDate = new Date(animal.entry_date);
      const entryWeight = parseFloat(animal.entry_weight_kg);
      const numWeighings = rand(3, 6);

      let prevWeight = entryWeight;
      let prevDate = entryDate;

      for (let w = 0; w < numWeighings; w++) {
        // Each weighing ~25-40 days apart
        const daysGap = rand(25, 40);
        const weighDate = addDays(prevDate, daysGap);

        // Don't create weighings in the future
        if (weighDate > new Date()) break;

        // Daily gain between 0.5 and 1.5 kg/day
        const dailyGain = Math.random() * 1.0 + 0.5;
        const weightGain = dailyGain * daysGap;
        const newWeight = Math.round((prevWeight + weightGain) * 100) / 100;

        // Calculate GMD
        const diffMs = weighDate - prevDate;
        const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const gmd =
          days > 0
            ? Math.round(((newWeight - prevWeight) / days) * 1000) / 1000
            : 0;

        await Weighing.create({
          animal_id: animal.id,
          weight_kg: newWeight,
          date: fmt(weighDate),
          gmd,
          notes: w === 0 ? "Primeira pesagem" : null,
        });

        console.log(
          `  Brinco ${animal.tag_number} | ${fmt(weighDate)} | ${newWeight}kg | GMD: ${gmd}`,
        );

        prevWeight = newWeight;
        prevDate = weighDate;
      }
    }

    // Create initial dashboard cache
    const activeAnimals = await Animal.count({ where: { status: "active" } });

    const { Sequelize } = require("sequelize");

    // Breed distribution
    const breedData = await Animal.findAll({
      attributes: [
        "breed",
        [Sequelize.fn("COUNT", Sequelize.col("breed")), "count"],
      ],
      where: { status: "active" },
      group: ["breed"],
      raw: true,
    });
    const breedDistribution = {};
    breedData.forEach((row) => {
      breedDistribution[row.breed] = parseInt(row.count);
    });

    // Category distribution
    const catData = await Animal.findAll({
      attributes: [
        "category",
        [Sequelize.fn("COUNT", Sequelize.col("category")), "count"],
      ],
      where: { status: "active" },
      group: ["category"],
      raw: true,
    });
    const categoryDistribution = {};
    catData.forEach((row) => {
      categoryDistribution[row.category] = parseInt(row.count);
    });

    // Average weight from latest weighings
    const latestWeighings = await Weighing.findAll({
      attributes: [
        "animal_id",
        [Sequelize.fn("MAX", Sequelize.col("date")), "last_date"],
      ],
      include: [{ model: Animal, where: { status: "active" }, attributes: [] }],
      group: ["animal_id"],
      raw: true,
    });

    let totalWeight = 0;
    let totalGmd = 0;
    let countWithWeighings = 0;

    for (const lw of latestWeighings) {
      const weighing = await Weighing.findOne({
        where: { animal_id: lw.animal_id, date: lw.last_date },
        raw: true,
      });
      if (weighing) {
        totalWeight += parseFloat(weighing.weight_kg);
        if (weighing.gmd) totalGmd += parseFloat(weighing.gmd);
        countWithWeighings++;
      }
    }

    const avgWeight =
      countWithWeighings > 0
        ? Math.round((totalWeight / countWithWeighings) * 100) / 100
        : 0;
    const avgGmd =
      countWithWeighings > 0
        ? Math.round((totalGmd / countWithWeighings) * 1000) / 1000
        : 0;

    // Weight history (monthly averages)
    const weightHistory = [];
    for (let m = 5; m >= 0; m--) {
      const d = new Date();
      d.setMonth(d.getMonth() - m);
      const monthStr = d.toISOString().slice(0, 7); // "YYYY-MM"
      const startDate = `${monthStr}-01`;
      const endDate =
        m > 0
          ? (() => {
              const nd = new Date(d);
              nd.setMonth(nd.getMonth() + 1);
              return `${nd.toISOString().slice(0, 7)}-01`;
            })()
          : "9999-12-31";

      const monthWeighings = await Weighing.findAll({
        where: {
          date: { [Sequelize.Op.gte]: startDate, [Sequelize.Op.lt]: endDate },
        },
        include: [
          { model: Animal, where: { status: "active" }, attributes: [] },
        ],
        raw: true,
      });

      if (monthWeighings.length > 0) {
        const avg =
          monthWeighings.reduce((sum, w) => sum + parseFloat(w.weight_kg), 0) /
          monthWeighings.length;
        weightHistory.push({
          month: monthStr,
          avg: Math.round(avg * 100) / 100,
        });
      }
    }

    await DashboardCache.create({
      id: 1,
      total_animals: activeAnimals,
      avg_weight_kg: avgWeight,
      avg_gmd: avgGmd,
      breed_distribution: breedDistribution,
      category_distribution: categoryDistribution,
      weight_history: weightHistory,
      calculated_at: new Date(),
    });

    console.log("\n✅ Seed concluído com sucesso!");
    console.log(`   ${activeAnimals} animais ativos`);
    console.log(`   Peso médio: ${avgWeight} kg`);
    console.log(`   GMD médio: ${avgGmd} kg/dia`);
    console.log(`   Raças: ${JSON.stringify(breedDistribution)}`);
    console.log(`   Categorias: ${JSON.stringify(categoryDistribution)}`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Erro no seed:", error);
    process.exit(1);
  }
}

seed();
