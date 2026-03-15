const router = require("express").Router();
const animalController = require("../controllers/animalController");
const weighingController = require("../controllers/weighingController");
const dashboardController = require("../controllers/dashboardController");

// Animais
router.get("/animals", animalController.index);
router.get("/animals/:id", animalController.show);
router.post("/animals", animalController.store);
router.put("/animals/:id", animalController.update);
router.delete("/animals/:id", animalController.destroy);

// Pesagens
router.get("/animals/:id/weighings", weighingController.index);
router.post("/animals/:id/weighings", weighingController.store);
router.delete("/weighings/:id", weighingController.destroy);

// Dashboard
router.get("/dashboard", dashboardController.show);
router.post("/dashboard/refresh", dashboardController.refresh);

module.exports = router;
