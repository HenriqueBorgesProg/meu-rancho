const app = require("./app");
const sequelize = require("./config/database");
require("dotenv").config();

require("./jobs/scheduler");

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await sequelize.authenticate();
    console.log("Conectado ao PostgreSQL!");
    await sequelize.sync({ alter: true });
    console.log("Tabelas sincronizadas!");
    app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
  } catch (error) {
    console.error("Erro ao iniciar:", error);
    process.exit(1);
  }
}

start();
