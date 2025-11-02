const db = require('../../config/config').db;

exports.assignFaculty = async (courseMappingId, inchargeId, creatingFaculties, deadline) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Check if the course mapping already exists in faculty_courses
    const [existingRecord] = await connection.query(
      "SELECT id FROM faculty_courses WHERE course_mapping_id = ?",
      [courseMappingId]
    );

    if (existingRecord.length === 0) {
      // Insert new assignment with in-charge faculty and wetting faculties
      await connection.query(
        "INSERT INTO faculty_courses (course_mapping_id, incharge_faculty_id, wetting_faculty_ids, deadline_date) VALUES (?, ?, ?, ?)",
        [courseMappingId, inchargeId, JSON.stringify(creatingFaculties), deadline]
      );
    } else {
      // Update existing record (in case of edit)
      await connection.query(
        "UPDATE faculty_courses SET incharge_faculty_id = ?, wetting_faculty_ids = ?, deadline_date = ? WHERE course_mapping_id = ?",
        [inchargeId, JSON.stringify(creatingFaculties), deadline, courseMappingId]
      );
    }

    await connection.commit();
    return { message: "Faculty assigned successfully" };
  } catch (error) {
    await connection.rollback();
    console.error("Error in assignFaculty:", error);
    throw new Error("Database error: " + error.message);
  } finally {
    connection.release();
  }
};

exports.getAssignedFaculties = async () => {
    try {
        const [rows] = await db.query(`
            SELECT 
    fc.id, 
    fc.course_mapping_id, 
    fc.incharge_faculty_id, 
    incharge.name AS incharge_faculty_name,  
    fc.wetting_faculty_ids, 
    fc.deadline_date, 
    fc.created_at,  
    c.default_course_code AS course_code, 
    c.course_name, c.default_course_code, c.course_introduction, c.objective, c.course_outcome, c.summary, c.syllabus_pdf,
    c.total_credits, c.lecture_credits, c.practical_credits, c.theory_credits,
    (
        SELECT GROUP_CONCAT(mu.name ORDER BY mu.name SEPARATOR ', ') 
        FROM master_users mu
        JOIN JSON_TABLE(fc.wetting_faculty_ids, '$[*]' 
            COLUMNS (user_id VARCHAR(255) PATH '$')) AS faculty_ids 
        ON mu.user_id COLLATE utf8mb4_unicode_ci = faculty_ids.user_id COLLATE utf8mb4_unicode_ci
    ) AS creating_faculties
FROM faculty_courses fc
JOIN master_courses c ON fc.course_mapping_id = c.id
LEFT JOIN master_users incharge ON fc.incharge_faculty_id COLLATE utf8mb4_unicode_ci = incharge.user_id COLLATE utf8mb4_unicode_ci;

        `);

        return rows;
    } catch (error) {
        throw new Error("Database error: " + error.message);
    }
};

exports.deleteAssignment = async (assignmentId) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // Check if the assignment exists before attempting to delete it
        const [existingRecord] = await connection.query(
            "SELECT id FROM faculty_courses WHERE id = ?",
            [assignmentId]
        );

        if (!existingRecord || existingRecord.length === 0) {
            throw new Error("Assignment not found");
        }

        // Delete the assignment from faculty_courses table
        const [deleteResult] = await connection.query(
            "DELETE FROM faculty_courses WHERE id = ?",
            [assignmentId]
        );

        await connection.commit();
        return { message: "Assignment deleted successfully" };
    } catch (error) {
        await connection.rollback();
        console.error("Error in deleteAssignment:", error);
        throw new Error("Database error: " + error.message);
    } finally {
        connection.release();
    }
};

exports.updateFacultyAssignment = async (assignmentId, courseMappingId, inchargeId, creatingFaculties, deadline) => {
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
  
      // Check if the assignment exists
      const [existingRecord] = await connection.query(
        "SELECT id FROM faculty_courses WHERE id = ?",
        [assignmentId]
      );
  
      if (existingRecord.length === 0) {
        throw new Error("Assignment not found.");
      }
  
      // Update the assignment
      await connection.query(
        "UPDATE faculty_courses SET course_mapping_id = ?, incharge_faculty_id = ?, wetting_faculty_ids = ?, deadline_date = ? WHERE id = ?",
        [courseMappingId, inchargeId, JSON.stringify(creatingFaculties), deadline, assignmentId]
      );
  
      await connection.commit();
      return { message: "Assignment updated successfully" };
    } catch (error) {
      await connection.rollback();
      console.error("Error in updateFacultyAssignment:", error);
      throw new Error("Database error: " + error.message);
    } finally {
      connection.release();
    }
  };

  exports.getAssignedFacultiesByUserId = async (userId) => {
    try {
        console.log("Fetching data for user:", userId); // ✅ Debug log

        const [rows] = await db.query(`
            SELECT 
                fc.id, 
                fc.course_mapping_id, 
                fc.incharge_faculty_id, 
                incharge.name AS incharge_faculty_name,  
                fc.wetting_faculty_ids, 
                fc.deadline_date, 
                fc.created_at,  
                c.default_course_code AS course_code, 
                c.course_name, c.default_course_code, c.course_introduction, c.objective, c.course_outcome, c.summary, c.syllabus_pdf,
                c.total_credits, c.lecture_credits, c.practical_credits, c.theory_credits,
                (
                    SELECT GROUP_CONCAT(mu.name ORDER BY mu.name SEPARATOR ', ') 
                    FROM master_users mu
                    JOIN JSON_TABLE(fc.wetting_faculty_ids, '$[*]' 
                        COLUMNS (user_id VARCHAR(255) PATH '$')) AS faculty_ids 
                    ON mu.user_id COLLATE utf8mb4_unicode_ci = faculty_ids.user_id COLLATE utf8mb4_unicode_ci
                ) AS creating_faculties
            FROM faculty_courses fc
            JOIN master_courses c ON fc.course_mapping_id = c.id
            LEFT JOIN master_users incharge ON fc.incharge_faculty_id COLLATE utf8mb4_unicode_ci = incharge.user_id COLLATE utf8mb4_unicode_ci
            WHERE fc.incharge_faculty_id = ? 
            OR JSON_CONTAINS(fc.wetting_faculty_ids, JSON_QUOTE(?), '$');
        `, [userId, userId]);

        console.log("Query Result in Model:", rows); // ✅ Debug log

        return rows;
    } catch (error) {
        console.error("Database error:", error.message);
        throw new Error("Database error: " + error.message);
    }
};

  

  








