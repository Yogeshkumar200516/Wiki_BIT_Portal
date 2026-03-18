const express = require("express");
const router = express.Router();
const facultyController = require("../controllers/facultyController.js");


// Get courses for wetting faculty
router.get("/wetting-faculty/:userId", facultyController.getCoursesForWettingFaculty);

router.post("/unit-plans", facultyController.uploadUnitPlan);
router.get("/notifications/:facultyId", facultyController.getFacultyNotifications);
router.put("/notifications/:notificationId/read", facultyController.markNotificationRead);
router.put("/notifications/read-all/:facultyId", facultyController.markAllNotificationsRead);
router.post("/lesson-plans", facultyController.submitLessonPlan);
router.get("/materials/:facultyId", facultyController.getLessonPlansForFaculty);


module.exports = router;


