const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.get('/courses', adminController.getAllCourses);
router.get('/faculties', adminController.getFaculties);
router.post('/assign-faculty', adminController.assignFacultyToCourse);
router.put("/update-assignment", adminController.updateFacultyAssignment);
router.get('/faculty-courses', adminController.getAssignedFaculties);
router.delete('/delete-assignment/:id', adminController.deleteAssignment);
router.get("/faculty-courses/:userId", adminController.getAssignedFacultiesByUserId);
router.get("/complaints", adminController.getAllComplaints);
router.put("/complaints/:id/review", adminController.reviewComplaint);
router.get("/faculty-scores", adminController.getFacultyScores);
router.get("/materials", adminController.getAllLessonPlans);
router.put("/materials/:id/approve", adminController.approveLessonPlan);
router.put("/materials/:id/reject", adminController.rejectLessonPlan);


module.exports = router;
