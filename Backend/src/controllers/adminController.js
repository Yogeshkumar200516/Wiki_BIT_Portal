const courseModel = require('../models/AdminModals/courseModal');
const facultyModel = require('../models/AdminModals/facultyModal');
const facultyCourseModel = require('../models/AdminModals/facultyCourseModal');
const complaintModel = require("../models/complaintModel");
const materialModel = require("../models/materialModel");

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

exports.getAllComplaints = async (req, res) => {
  try {
    const complaints = await complaintModel.getAllComplaints();
    res.status(200).json({ success: true, data: complaints });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.reviewComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const { decision, reason, targetFacultyId } = req.body;

    if (!decision || !reason) {
      return res
        .status(400)
        .json({ success: false, message: "Decision and reason are required" });
    }

    const updatedComplaint = await complaintModel.reviewComplaint({
      complaintId: id,
      decision,
      reason,
      targetFacultyId,
    });

    res.status(200).json({ success: true, data: updatedComplaint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getFacultyScores = async (req, res) => {
  try {
    const faculties = await complaintModel.getFacultyScores();
    res.status(200).json({ success: true, data: faculties });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllLessonPlans = async (req, res) => {
  try {
    const materials = await materialModel.getAllLessonPlans();
    res.status(200).json({ success: true, data: materials });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.approveLessonPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await materialModel.updateLessonPlanStatus(id, "Approved", "");
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.rejectLessonPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    if (!reason) {
      return res.status(400).json({ success: false, message: "Reason is required" });
    }
    const updated = await materialModel.updateLessonPlanStatus(id, "Rejected", reason);
    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

  

  
  
  
  




