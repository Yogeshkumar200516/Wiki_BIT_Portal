const FacultyModel = require("../models/FacultyModals/facultyModel.js"); // Ensure correct import
const { upsertUnitPlan } = require("../models/FacultyModals/unitPlanModel.js");
const complaintModel = require("../models/complaintModel");
const materialModel = require("../models/materialModel");

// Get courses assigned to the wetting faculty
exports.getCoursesForWettingFaculty = async (req, res) => {
    try {
        const userId = req.params.userId;
        const courses = await FacultyModel.getCoursesForWettingFaculty(userId); // Ensure function is called properly

        res.status(200).json({
            success: true,
            data: courses,
        });
    } catch (error) {
        console.error("Error fetching courses:", error.message);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};


exports.uploadUnitPlan = async (req, res) => {
  try {
    const unitPlanData = req.body;
    const result = await upsertUnitPlan(unitPlanData);

    res.status(200).json({
      success: true,
      message: "✅ Unit plan uploaded/updated successfully!",
      affectedRows: result.affectedRows,
    });
  } catch (error) {
    console.error("❌ Upload failed:", error);
    res.status(500).json({
      success: false,
      message: "❌ Failed to upload/update unit plan",
      error: error.message,
    });
  }
};

exports.getFacultyNotifications = async (req, res) => {
  try {
    const { facultyId } = req.params;
    const notifications = await complaintModel.getFacultyNotifications(facultyId);
    res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.markNotificationRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    await complaintModel.markNotificationRead(notificationId);
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.markAllNotificationsRead = async (req, res) => {
  try {
    const { facultyId } = req.params;
    await complaintModel.markAllNotificationsRead(facultyId);
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.submitLessonPlan = async (req, res) => {
  try {
    const result = await materialModel.createOrUpdateLessonPlan(req.body);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getLessonPlansForFaculty = async (req, res) => {
  try {
    const { facultyId } = req.params;
    const data = await materialModel.getLessonPlansForFaculty(facultyId);
    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};


