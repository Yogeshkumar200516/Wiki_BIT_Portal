const materialModel = require("../models/materialModel");

exports.getMaterialsByCourseId = async (req, res) => {
  try {
    const { courseId } = req.params;
    if (!courseId) {
      return res.status(400).json({ success: false, message: "courseId is required" });
    }

    const materials = await materialModel.getApprovedMaterialsByCourseCode(courseId);
    res.status(200).json({ success: true, data: materials });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
