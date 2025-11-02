const db = require('../../config/config').db;

exports.getAllFaculties = async () => {
    try {
        const [faculties] = await db.query(`
            SELECT 
                mu.id, 
                mu.user_id,
                mu.name, 
                mu.role, 
                md.department_name,
                md.department_code 
            FROM master_users mu
            LEFT JOIN master_departments md ON mu.department_id = md.id
            WHERE mu.role = 'Faculty'
        `);
        return faculties;
    } catch (error) {
        throw new Error(error.message);
    }
};
