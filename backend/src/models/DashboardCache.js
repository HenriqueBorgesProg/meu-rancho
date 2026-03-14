const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const DashboardCache = sequelize.define(
  "DashboardCache",
  {
    total_animals: {
      type: DataTypes.INTEGER,
    },
    avg_weight_kg: {
      type: DataTypes.DECIMAL(6, 2),
    },
    avg_gmd: {
      type: DataTypes.DECIMAL(5, 3),
    },
    breed_distribution: {
      type: DataTypes.JSON,
    },
    category_distribution: {
      type: DataTypes.JSON,
    },
    weight_history: {
      type: DataTypes.JSON,
    },
    calculated_at: {
      type: DataTypes.DATE,
    },
  },
  {
    tableName: "dashboard_cache",
    underscored: true,
  },
);

module.exports = DashboardCache;
