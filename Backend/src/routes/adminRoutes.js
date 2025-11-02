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


module.exports = router;
