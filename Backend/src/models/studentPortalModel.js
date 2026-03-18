const { db } = require("../config/config");

const hasColumn = async (tableName, columnName) => {
  const [rows] = await db.query(`SHOW COLUMNS FROM ${tableName} LIKE ?`, [columnName]);
  return rows.length > 0;
};

const getStudentDashboard = async (studentId, semesterOverride) => {
  const hasCurrentSemester = await hasColumn("master_users", "current_semester");

  const currentSemesterSelect = hasCurrentSemester
    ? "mu.current_semester AS current_semester"
    : "NULL AS current_semester";

  const [studentRows] = await db.query(
    `
      SELECT
        mu.user_id,
        mu.name,
        md.department_name,
        md.department_code,
        ${currentSemesterSelect}
      FROM master_users mu
      LEFT JOIN master_departments md ON md.id = mu.department_id
      WHERE mu.user_id = ?
      LIMIT 1
    `,
    [studentId]
  );

  const student = studentRows[0] || {};
  const resolvedSemester = Number(semesterOverride || student.current_semester || 1);
  const departmentCode = student.department_code || "";

  const hasDepartmentCode = await hasColumn("master_courses", "department_code");
  const hasSemester = await hasColumn("master_courses", "semester");
  const hasCourseType = await hasColumn("master_courses", "course_type");

  const departmentExpr = hasDepartmentCode
    ? "mc.department_code"
    : "SUBSTRING(mc.default_course_code, 3, 2)";
  const semesterExpr = hasSemester
    ? "mc.semester"
    : "SUBSTRING(mc.default_course_code, -3, 1)";
  const courseTypeExpr = hasCourseType
    ? "mc.course_type"
    : "CASE WHEN LOWER(mc.course_name) LIKE '%elective%' THEN 'Elective' ELSE 'Core' END";

  const [courseRows] = await db.query(`
    SELECT *
    FROM (
      SELECT
        mc.default_course_code AS code,
        mc.course_name AS name,
        COALESCE(mc.lecture_credits, 0) AS L,
        COALESCE(mc.theory_credits, 0) AS T,
        COALESCE(mc.practical_credits, 0) AS P,
        COALESCE(mc.total_credits, 0) AS C,
        UPPER(${departmentExpr}) AS departmentCode,
        CAST(${semesterExpr} AS UNSIGNED) AS semester,
        ${courseTypeExpr} AS courseType
      FROM master_courses mc
    ) course_list
    WHERE course_list.departmentCode = ? AND course_list.semester = ?
    ORDER BY course_list.code ASC
  `, [departmentCode.toUpperCase(), resolvedSemester]);

  const [semesterRows] = await db.query(`
    SELECT DISTINCT CAST(${semesterExpr} AS UNSIGNED) AS semester
    FROM master_courses mc
    WHERE UPPER(${departmentExpr}) = ?
    ORDER BY semester
  `, [departmentCode.toUpperCase()]);

  const availableSemesters = semesterRows
    .map((row) => Number(row.semester))
    .filter((semester) => Number.isFinite(semester) && semester > 0);

  const courses = courseRows.map((course) => ({
    type: String(course.courseType || "Core").toLowerCase() === "elective" ? "elective" : "core",
    code: course.code,
    name: course.name,
    PEOs: "-",
    POs: "-",
    L: Number(course.L || 0),
    T: Number(course.T || 0),
    P: Number(course.P || 0),
    C: Number(course.C || 0),
    semester: Number(course.semester || resolvedSemester),
    departmentCode: course.departmentCode || departmentCode,
  }));

  const minimumCreditsToEarn = courses.reduce((sum, course) => sum + course.C, 0);

  return {
    name: student.name || studentId,
    academicYear: "2025-2026",
    departmentName: student.department_name || "N/A",
    departmentCode: departmentCode || "N/A",
    currentSemester: resolvedSemester,
    availableSemesters: availableSemesters.length ? availableSemesters : [1, 2, 3, 4, 5, 6, 7, 8],
    minimumCreditsToEarn,
    courses,
  };
};

const getLectureMaterials = async () => {
  const [rows] = await db.query(`
    SELECT
      up.id,
      up.unit_number,
      up.unit_name,
      up.reference,
      up.mind_map,
      up.approval_status,
      mc.course_name,
      mc.default_course_code,
      mu.name AS faculty_name
    FROM unit_plans up
    JOIN master_courses mc ON mc.id = up.course_mapping_id
    LEFT JOIN master_users mu ON mu.user_id = up.faculty_id
    WHERE up.approval_status = 'Approved'
    ORDER BY up.unit_number ASC
  `);

  return rows.map((row) => ({
    id: row.id,
    course: row.course_name,
    courseCode: row.default_course_code,
    faculty: row.faculty_name || "Faculty",
    title: row.unit_name || `Unit ${row.unit_number}`,
    unit: `Unit ${row.unit_number}`,
    type: "Doc",
    date: new Date().toISOString().slice(0, 10),
    file: row.reference || row.mind_map || "",
  }));
};

module.exports = {
  getStudentDashboard,
  getLectureMaterials,
};
