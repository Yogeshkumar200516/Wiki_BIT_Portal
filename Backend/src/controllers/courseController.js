const courseModel = require("../models/courseModel");

exports.getCourses = async (req, res) => {
  try {
    const { department, semester } = req.query;

    if (!department || !semester) {
      return res.status(400).json({
        success: false,
        message: "department and semester are required",
      });
    }

    const semesterNumber = Number(semester);
    if (!Number.isFinite(semesterNumber) || semesterNumber < 1) {
      return res.status(400).json({
        success: false,
        message: "semester must be a valid number",
      });
    }

    const courses = await courseModel.getCoursesByDepartmentSemester(
      department,
      semesterNumber
    );

    res.status(200).json({ success: true, data: courses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
