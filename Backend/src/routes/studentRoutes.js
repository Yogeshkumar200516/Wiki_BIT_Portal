const express = require("express");
const router = express.Router();
const studentController = require("../controllers/studentController");

router.get("/complaints/:studentId", studentController.getStudentComplaints);
router.post("/complaints", studentController.createComplaint);
router.get("/dashboard/:studentId", studentController.getStudentDashboard);
router.get("/materials", studentController.getLectureMaterials);

module.exports = router;
