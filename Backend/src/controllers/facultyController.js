const FacultyModel = require("../models/FacultyModals/facultyModel.js"); // Ensure correct import
const { upsertUnitPlan } = require("../models/FacultyModals/unitPlanModel.js");

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


