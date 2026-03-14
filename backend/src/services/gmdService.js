const { Animal, Weighing } = require("../models");

async function calcularGMD(animalId, pesoAtualKg, dataPesagem) {
  const ultimaPesagem = await Weighing.findOne({
    where: { animal_id: animalId },
    order: [["date", "DESC"]],
  });

  let pesoReferencia, dataReferencia;

  if (ultimaPesagem) {
    pesoReferencia = ultimaPesagem.weight_kg;
    dataReferencia = ultimaPesagem.date;
  } else {
    const animal = await Animal.findByPk(animalId);
    pesoReferencia = animal.entry_weight_kg;
    dataReferencia = animal.entry_date;
  }

  const dias = Math.floor(
    (new Date(dataPesagem) - new Date(dataReferencia)) / (1000 * 60 * 60 * 24),
  );

  if (dias <= 0) return 0;

  const gmd = (pesoAtualKg - pesoReferencia) / dias;
  return Math.round(gmd * 1000) / 1000;
}

module.exports = { calcularGMD };
