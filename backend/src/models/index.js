const Animal = require("./Animal");
const Weighing = require("./Weighing");
const DashboardCache = require("./DashboardCache");

Animal.hasMany(Weighing, { foreignKey: "animal_id", as: "weighings" });
Weighing.belongsTo(Animal, { foreignKey: "animal_id" });

module.exports = { Animal, Weighing, DashboardCache };
