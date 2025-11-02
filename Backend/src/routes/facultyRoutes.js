const express = require("express");
const router = express.Router();
const facultyController = require("../controllers/facultyController.js");


// Get courses for wetting faculty
router.get("/wetting-faculty/:userId", facultyController.getCoursesForWettingFaculty);

router.post("/unit-plans", facultyController.uploadUnitPlan);


module.exports = router;


