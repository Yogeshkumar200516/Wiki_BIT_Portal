const { db } = require("../../config/config.js");

const FacultyModel = {
    getCoursesForWettingFaculty: async (userId) => {
        try {
            const [rows] = await db.query(`
                SELECT 
                    fc.id, 
                    fc.course_mapping_id,
                    c.course_name, 
                    c.default_course_code AS course_code, 
                    fc.deadline_date
                FROM faculty_courses fc
                JOIN master_courses c ON fc.course_mapping_id = c.id
                WHERE JSON_CONTAINS(fc.wetting_faculty_ids, JSON_QUOTE(?), '$');
            `, [userId]);

            return rows;
        } catch (error) {
            console.error("Database error:", error.message);
            throw new Error("Database error: " + error.message);
        }
    }
};

module.exports = FacultyModel;
