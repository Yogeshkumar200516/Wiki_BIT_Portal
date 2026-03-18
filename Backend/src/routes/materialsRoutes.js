const express = require("express");
const router = express.Router();
const materialsController = require("../controllers/materialsController");

router.get("/:courseId", materialsController.getMaterialsByCourseId);

module.exports = router;
