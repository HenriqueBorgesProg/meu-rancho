const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Weighing = sequelize.define(
  "Weighing",
  {
    animal_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    weight_kg: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: false,
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    gmd: {
      type: DataTypes.DECIMAL(5, 3),
      allowNull: true,
    },
    notes: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
  },
  {
    tableName: "weighings",
    underscored: true,
    updatedAt: false,
  },
);

module.exports = Weighing;
