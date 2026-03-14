const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Animal = sequelize.define(
  "Animal",
  {
    tag_number: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    breed: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    sex: {
      type: DataTypes.CHAR(1),
      allowNull: false,
    },
    birth_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    entry_weight_kg: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: false,
    },
    entry_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING(10),
      defaultValue: "active",
    },
  },
  {
    tableName: "animals",
    underscored: true,
  },
);

module.exports = Animal;
