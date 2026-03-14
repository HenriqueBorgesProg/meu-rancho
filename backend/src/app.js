const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Routes will be added on Day 2
// const routes = require('./routes')
// app.use('/api', routes)

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Meu Rebanho API rodando!" });
});

// Error handler global
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "Erro interno" });
});

module.exports = app;
