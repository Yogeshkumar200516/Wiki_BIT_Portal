const courseModel = require('../models/AdminModals/courseModal');
const facultyModel = require('../models/AdminModals/facultyModal');
const facultyCourseModel = require('../models/AdminModals/facultyCourseModal');

exports.getAllCourses = async (req, res) => {
    try {
        const courses = await courseModel.getAllCourses();
        res.status(200).json({ success: true, data: courses });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getFaculties = async (req, res) => {
    try {
        const faculties = await facultyModel.getAllFaculties();
        res.status(200).json({ success: true, data: faculties });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.assignFacultyToCourse = async (req, res) => {
    try {
      console.log('Request Body:', req.body);  // Log the incoming data
  
      const { courseMappingId, inchargeId, creatingFaculties, deadline } = req.body;
  
      if (!courseMappingId || !inchargeId || !Array.isArray(creatingFaculties) || creatingFaculties.length === 0 || !deadline) {
        return res.status(400).json({ success: false, message: "Invalid or missing required fields" });
      }
  
      const result = await facultyCourseModel.assignFaculty(courseMappingId, inchargeId, creatingFaculties, deadline);
      res.status(200).json({ success: true, message: result.message });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: error.message });
    }
  };

  // Fetch all faculty assignments
  exports.getAssignedFaculties = async (req, res) => {
      try {
          const result = await facultyCourseModel.getAssignedFaculties();
          res.status(200).json({ success: true, data: result });
      } catch (error) {
          res.status(500).json({ success: false, message: error.message });
      }
  };

  exports.deleteAssignment = async (req, res) => {
    try {
        const { id } = req.params;  // Get assignment ID from URL parameter

        if (!id) {
            return res.status(400).json({ success: false, message: "Assignment ID is required" });
        }

        // Call the model function to delete the assignment
        const result = await facultyCourseModel.deleteAssignment(id);
        
        return res.status(200).json({ success: true, message: result.message });
    } catch (error) {
        console.error("Error in deleteAssignment:", error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

exports.updateFacultyAssignment = async (req, res) => {
    try {
      console.log("Update Request Body:", req.body); // Log incoming request data
  
      const { assignmentId, courseMappingId, inchargeId, creatingFaculties, deadline } = req.body;
  
      if (!assignmentId || !courseMappingId || !inchargeId || !Array.isArray(creatingFaculties) || creatingFaculties.length === 0 || !deadline) {
        return res.status(400).json({ success: false, message: "Invalid or missing required fields" });
      }
  
      const result = await facultyCourseModel.updateFacultyAssignment(
        assignmentId,
        courseMappingId,
        inchargeId,
        creatingFaculties,
        deadline
      );
  
      res.status(200).json({ success: true, message: result.message });
    } catch (error) {
      console.error("Error in updateFacultyAssignment:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  };

  exports.getAssignedFacultiesByUserId = async (req, res) => {
    try {
        const userId = req.params.userId; // Extract user_id from URL
        console.log("Received userId:", userId); // ✅ Log userId for debugging

        const faculties = await facultyCourseModel.getAssignedFacultiesByUserId(userId);
        console.log("Query Result:", faculties); // ✅ Log the actual MySQL response

        res.status(200).json({
            success: true,
            data: faculties,
        });
    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

  

  
  
  
  




