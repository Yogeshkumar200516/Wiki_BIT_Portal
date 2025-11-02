const db = require('../../config/config').db;

exports.getAllCourses = async () => {
    try {
        const [courses] = await db.query(`
            SELECT 
                mc.id AS course_id,
                mc.default_course_code AS course_code,
                mc.course_name,
                SUBSTRING(mc.default_course_code, -3, 1) AS semester,  -- Extract semester (3rd character from the end)
                SUBSTRING(mc.default_course_code, 3, 2) AS department_code -- Extract department code (2 characters after first 2 digits)
            FROM master_courses mc
        `);

        return courses;
    } catch (error) {
        throw new Error(error.message);
    }
};
