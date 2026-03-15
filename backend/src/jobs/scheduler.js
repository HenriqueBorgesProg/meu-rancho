const cron = require("node-cron");
const { DashboardCache } = require("../models");
const { calcularIndicadores } = require("../controllers/dashboardController");

cron.schedule("*/30 * * * *", async () => {
  console.log("[CRON] Recalculando indicadores do dashboard...");
  try {
    const dados = await calcularIndicadores();
    await DashboardCache.upsert({ id: 1, ...dados, calculated_at: new Date() });
    console.log("[CRON] Dashboard atualizado com sucesso");
  } catch (error) {
    console.log("Error: ", error);
  }
});
