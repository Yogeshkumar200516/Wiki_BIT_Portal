const { db } = require("../../config/config"); // Ensure correct path

// Upsert Unit Plan into DB
const upsertUnitPlan = async (unitPlanData) => {
    const sql = `
    INSERT INTO unit_plans 
    (course_mapping_id, faculty_id, unit_number, unit_name, introduction, summary, reference, mind_map, objective, outcomes, approval_status) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE 
    unit_name = VALUES(unit_name), 
    introduction = VALUES(introduction), 
    summary = VALUES(summary), 
    reference = VALUES(reference), 
    mind_map = VALUES(mind_map), 
    objective = VALUES(objective), 
    outcomes = VALUES(outcomes), 
    approval_status = "Pending";
  `;  

  const values = [
    unitPlanData.course_mapping_id || null,
    unitPlanData.faculty_id || null,
    unitPlanData.unit_number || null,
    unitPlanData.unit_name || null,
    unitPlanData.introduction || null,
    unitPlanData.summary || null,
    unitPlanData.reference || null,
    unitPlanData.mind_map || null,
    unitPlanData.objective || null,
    unitPlanData.outcomes || null,
    "Pending", // Default approval status
  ];

  try {
    const [result] = await db.execute(sql, values);
    return result;
  } catch (error) {
    console.error("❌ Error upserting unit plan:", error);
    throw error;
  }
};

module.exports = {
  upsertUnitPlan,
};
