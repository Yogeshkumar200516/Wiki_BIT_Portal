const complaintModel = require("../models/complaintModel");
const studentPortalModel = require("../models/studentPortalModel");

exports.getStudentComplaints = async (req, res) => {
  try {
    const { studentId } = req.params;
    const complaints = await complaintModel.getComplaintsForStudent(studentId);
    res.status(200).json({ success: true, data: complaints });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createComplaint = async (req, res) => {
  try {
    const { studentUserId, facultyId, title, category, description, photoProof } = req.body;

    if (!studentUserId || !facultyId || !title || !category || !description) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    const complaint = await complaintModel.createComplaint({
      studentUserId,
      facultyId,
      title,
      category,
      description,
      photoProof,
    });

    res.status(201).json({ success: true, data: complaint });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getStudentDashboard = async (req, res) => {
  try {
    const { studentId } = req.params;
    const semester = req.query.semester ? Number(req.query.semester) : undefined;
    const dashboardData = await studentPortalModel.getStudentDashboard(studentId, semester);
    res.status(200).json({ success: true, data: dashboardData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getLectureMaterials = async (req, res) => {
  try {
    const materials = await studentPortalModel.getLectureMaterials();
    res.status(200).json({ success: true, data: materials });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
