const { db } = require("../config/config");
const { createFacultyNotification } = require("./complaintModel");

const getTableColumns = async (tableName) => {
  const [rows] = await db.query(`SHOW COLUMNS FROM ${tableName}`);
  return rows.map((row) => row.Field);
};

const getTableColumnInfo = async (tableName) => {
  const [rows] = await db.query(`SHOW COLUMNS FROM ${tableName}`);
  return rows;
};

const isNumericSqlType = (sqlType) =>
  /int|bigint|smallint|tinyint|mediumint|decimal|numeric|float|double/i.test(
    sqlType || ""
  );

const isDateSqlType = (sqlType) => /date|time|timestamp|datetime/i.test(sqlType || "");

const parseSqlEnumValues = (sqlType) => {
  const match = (sqlType || "").match(/^(enum|set)\((.*)\)$/i);
  if (!match) return [];
  const rawValues = match[2];
  const valueMatches = rawValues.match(/'((?:\\'|[^'])*)'/g) || [];
  return valueMatches.map((value) => value.slice(1, -1).replace(/\\'/g, "'"));
};

const getFallbackValueForColumn = (column, context = {}) => {
  const field = column.Field;
  const type = column.Type || "";

  if (context[field] !== undefined) return context[field];
  if (field === "status") return context.status || "Pending";
  if (field === "admin_feedback") return context.admin_feedback ?? null;
  if (field === "unit_plan_id") return context.unit_plan_id ?? null;
  if (field === "lesson_plan_number") return context.lesson_plan_number || "";
  if (field === "lesson_plan_title") return context.lesson_plan_title || "";
  if (field === "pdf_url") return context.pdf_url || null;
  if (field === "video_url") return context.video_url || null;
  if (field === "discourse_url") return context.discourse_url || null;
  if (field === "unit_number") return context.unit_number || null;
  if (field === "course_mapping_id") return context.course_mapping_id ?? 0;
  if (field === "faculty_id") return context.faculty_id || "";
  if (field === "created_at" || field === "updated_at") return new Date();

  if (isNumericSqlType(type)) return 0;
  if (isDateSqlType(type)) return new Date();

  const enumValues = parseSqlEnumValues(type);
  if (enumValues.length) return enumValues[0];

  return "";
};

const buildInsertPayload = async (tableName, valueMap, context = {}) => {
  const columnInfo = await getTableColumnInfo(tableName);
  const availableColumns = new Set(columnInfo.map((column) => column.Field));
  const columns = [];
  const values = [];

  Object.keys(valueMap).forEach((field) => {
    if (availableColumns.has(field) && valueMap[field] !== undefined) {
      columns.push(field);
      values.push(valueMap[field]);
    }
  });

  for (const column of columnInfo) {
    const isRequired = column.Null === "NO" && column.Default === null;
    const isAutoIncrement = String(column.Extra || "").toLowerCase().includes("auto_increment");
    const alreadySet = columns.includes(column.Field);
    if (isAutoIncrement || alreadySet) continue;
    if (isRequired) {
      const fallbackValue = getFallbackValueForColumn(column, context);
      columns.push(column.Field);
      values.push(fallbackValue);
    }
  }

  return { columns, values, columnInfo };
};

const ensureColumnExists = async (tableName, columnName, definition) => {
  const columns = await getTableColumns(tableName);
  if (!columns.includes(columnName)) {
    await db.query(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`);
  }
};

const ensureColumnType = async (tableName, columnName, definition) => {
  const columns = await getTableColumnInfo(tableName);
  const column = columns.find((col) => col.Field === columnName);
  if (!column) return;
  if (isNumericSqlType(column.Type) || column.Null === "NO") {
    await db.query(`ALTER TABLE ${tableName} MODIFY COLUMN ${columnName} ${definition}`);
  }
};

const forceColumnType = async (tableName, columnName, definition) => {
  const columns = await getTableColumnInfo(tableName);
  const column = columns.find((col) => col.Field === columnName);
  if (!column) return;
  await db.query(`ALTER TABLE ${tableName} MODIFY COLUMN ${columnName} ${definition}`);
};

const ensureIndexExists = async (tableName, indexName, createSql) => {
  const [rows] = await db.query(`SHOW INDEX FROM ${tableName} WHERE Key_name = ?`, [indexName]);
  if (!rows.length) {
    await db.query(createSql);
  }
};

const isFacultyAssignedToCourse = async (courseMappingId, facultyId) => {
  const [rows] = await db.query(
    `
      SELECT id
      FROM faculty_courses
      WHERE course_mapping_id = ?
        AND (incharge_faculty_id = ? OR JSON_CONTAINS(wetting_faculty_ids, JSON_QUOTE(?), '$'))
      LIMIT 1
    `,
    [courseMappingId, facultyId, facultyId]
  );
  return rows.length > 0;
};

const initializeLessonPlanTables = async () => {
  await db.query(`
    CREATE TABLE IF NOT EXISTS lesson_plans (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      course_mapping_id BIGINT NOT NULL,
      faculty_id VARCHAR(255) NOT NULL,
      unit_number VARCHAR(50) NULL,
      lesson_plan_number VARCHAR(50) NOT NULL,
      lesson_plan_title VARCHAR(255) NOT NULL,
      pdf_url TEXT NULL,
      video_url TEXT NULL,
      discourse_url TEXT NULL,
      status ENUM('Pending','Approved','Rejected') DEFAULT 'Pending',
      admin_feedback TEXT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_lesson_course (course_mapping_id),
      INDEX idx_lesson_faculty (faculty_id),
      INDEX idx_lesson_status (status)
    )
  `);

  await ensureColumnExists("lesson_plans", "course_mapping_id", "BIGINT NOT NULL");
  await ensureColumnExists("lesson_plans", "faculty_id", "VARCHAR(255) NOT NULL");
  await ensureColumnExists("lesson_plans", "unit_number", "VARCHAR(50) NULL");
  await ensureColumnExists("lesson_plans", "lesson_plan_number", "VARCHAR(50) NOT NULL");
  await ensureColumnExists("lesson_plans", "lesson_plan_title", "VARCHAR(255) NOT NULL");
  await ensureColumnExists("lesson_plans", "unit_plan_id", "INT NOT NULL");
  await ensureColumnExists("lesson_plans", "pdf_url", "TEXT NULL");
  await ensureColumnExists("lesson_plans", "video_url", "TEXT NULL");
  await ensureColumnExists("lesson_plans", "discourse_url", "TEXT NULL");
  await ensureColumnExists(
    "lesson_plans",
    "status",
    "ENUM('Pending','Approved','Rejected') DEFAULT 'Pending'"
  );
  await ensureColumnExists("lesson_plans", "admin_feedback", "TEXT NULL");
  await ensureColumnExists("lesson_plans", "created_at", "TIMESTAMP DEFAULT CURRENT_TIMESTAMP");
  await ensureColumnExists(
    "lesson_plans",
    "updated_at",
    "TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
  );

  await ensureIndexExists(
    "lesson_plans",
    "uniq_lesson_plan",
    "ALTER TABLE lesson_plans ADD UNIQUE KEY uniq_lesson_plan (course_mapping_id, faculty_id, unit_number, lesson_plan_number)"
  );

  await ensureColumnType("lesson_plans", "lesson_plan_number", "VARCHAR(50) NOT NULL");
  await ensureColumnType("lesson_plans", "unit_plan_id", "INT NOT NULL");
  await forceColumnType("lesson_plans", "lecture_material", "LONGTEXT NULL");
  await forceColumnType("lesson_plans", "lecture_video", "TEXT NULL");
  await forceColumnType("lesson_plans", "discourse_link", "TEXT NULL");
  await forceColumnType("lesson_plans", "pdf_url", "LONGTEXT NULL");
  await forceColumnType("lesson_plans", "video_url", "TEXT NULL");
  await forceColumnType("lesson_plans", "discourse_url", "TEXT NULL");
};

const getUnitPlanId = async ({ courseMappingId, facultyId, unitNumber }) => {
  if (!courseMappingId || !facultyId || unitNumber === undefined || unitNumber === null) {
    return null;
  }
  const [rows] = await db.query(
    `
      SELECT id
      FROM unit_plans
      WHERE course_mapping_id = ?
        AND faculty_id = ?
        AND unit_number = ?
      ORDER BY id DESC
      LIMIT 1
    `,
    [courseMappingId, facultyId, unitNumber]
  );
  return rows.length ? rows[0].id : null;
};

const ensureUnitPlanId = async ({ courseMappingId, facultyId, unitNumber, unitName }) => {
  const existingId = await getUnitPlanId({ courseMappingId, facultyId, unitNumber });
  if (existingId) return existingId;

  const resolvedUnitNumber = Number(unitNumber);
  if (!Number.isFinite(resolvedUnitNumber)) {
    throw new Error("Unit number must be numeric.");
  }

  const name = unitName && String(unitName).trim()
    ? String(unitName).trim()
    : `Unit ${resolvedUnitNumber}`;

  const [result] = await db.query(
    `
      INSERT INTO unit_plans
        (course_mapping_id, faculty_id, unit_number, unit_name, approval_status)
      VALUES (?, ?, ?, ?, 'Pending')
    `,
    [courseMappingId, facultyId, resolvedUnitNumber, name]
  );

  return result.insertId;
};

const createOrUpdateLessonPlan = async (data) => {
  const {
    course_mapping_id,
    faculty_id,
    unit_number,
    lesson_plan_number,
    lesson_plan_title,
    pdf_url,
    video_url,
    discourse_url,
  } = data;

  if (!course_mapping_id || !faculty_id || !lesson_plan_number || !lesson_plan_title) {
    throw new Error("Missing required lesson plan fields");
  }

  const isAssigned = await isFacultyAssignedToCourse(course_mapping_id, faculty_id);
  if (!isAssigned) {
    throw new Error("Faculty is not assigned to this course");
  }

  const unitPlanId = await ensureUnitPlanId({
    courseMappingId: course_mapping_id,
    facultyId: faculty_id,
    unitNumber: unit_number,
    unitName: lesson_plan_title,
  });

  const valueMap = {
    course_mapping_id,
    faculty_id,
    unit_number: unit_number || null,
    unit_plan_id: unitPlanId,
    lesson_plan_number,
    lesson_plan_title,
    lesson_plan_name: lesson_plan_title,
    lecture_material: pdf_url || null,
    lecture_video: video_url || null,
    discourse_link: discourse_url || null,
    pdf_url: pdf_url || null,
    video_url: video_url || null,
    discourse_url: discourse_url || null,
    status: "Pending",
    admin_feedback: null,
  };

  const insertPayload = await buildInsertPayload("lesson_plans", valueMap, valueMap);
  const insertColumns = insertPayload.columns;
  const insertValues = insertPayload.values;
  const insertPlaceholders = insertColumns.map(() => "?").join(", ");

  const updateColumns = [
    "lesson_plan_name",
    "lecture_material",
    "lecture_video",
    "discourse_link",
    "lesson_plan_title",
    "pdf_url",
    "video_url",
    "discourse_url",
    "status",
    "admin_feedback",
    "unit_number",
  ].filter((column) => insertColumns.includes(column));

  const updateClause = updateColumns
    .map((column) =>
      column === "status"
        ? `${column} = 'Pending'`
        : column === "admin_feedback"
        ? `${column} = NULL`
        : `${column} = VALUES(${column})`
    )
    .join(", ");

  const updateSql = updateClause ? `ON DUPLICATE KEY UPDATE ${updateClause}` : "";

  await db.query(
    `
      INSERT INTO lesson_plans (${insertColumns.join(", ")})
      VALUES (${insertPlaceholders})
      ${updateSql}
    `,
    insertValues
  );

  const [rows] = await db.query(
    `
      SELECT *
      FROM lesson_plans
      WHERE course_mapping_id = ? AND faculty_id = ? AND unit_number <=> ? AND lesson_plan_number = ?
      ORDER BY updated_at DESC
      LIMIT 1
    `,
    [course_mapping_id, faculty_id, unit_number || null, lesson_plan_number]
  );

  return rows[0] || null;
};

const getAllLessonPlans = async () => {
  const [rows] = await db.query(
    `
      SELECT
        lp.id,
        lp.course_mapping_id,
        lp.faculty_id,
        lp.unit_number,
        lp.lesson_plan_number,
        lp.lesson_plan_title,
        lp.pdf_url,
        lp.video_url,
        lp.discourse_url,
        lp.status,
        lp.admin_feedback,
        lp.created_at,
        mc.course_name,
        mc.default_course_code,
        mu.name AS faculty_name,
        mu.user_id AS faculty_user_id,
        md.department_name
      FROM lesson_plans lp
      LEFT JOIN master_courses mc ON mc.id = lp.course_mapping_id
      LEFT JOIN master_users mu ON mu.user_id = lp.faculty_id
      LEFT JOIN master_departments md ON md.id = mu.department_id
      ORDER BY lp.created_at DESC
    `
  );

  return rows.map((row) => ({
    id: row.id,
    courseMappingId: row.course_mapping_id,
    facultyId: row.faculty_id,
    unitNumber: row.unit_number,
    lessonPlanNumber: row.lesson_plan_number,
    lessonPlanTitle: row.lesson_plan_title,
    pdfUrl: row.pdf_url,
    videoUrl: row.video_url,
    discourseUrl: row.discourse_url,
    status: row.status || "Pending",
    adminFeedback: row.admin_feedback || "",
    uploadedAt: row.created_at,
    course: row.course_name || "N/A",
    courseCode: row.default_course_code || "",
    facultyName: row.faculty_name || row.faculty_id,
    department: row.department_name || "N/A",
  }));
};

const getLessonPlansForFaculty = async (facultyId) => {
  const [rows] = await db.query(
    `
      SELECT
        lp.id,
        lp.course_mapping_id,
        lp.faculty_id,
        lp.unit_number,
        lp.lesson_plan_number,
        lp.lesson_plan_title,
        lp.pdf_url,
        lp.video_url,
        lp.discourse_url,
        lp.status,
        lp.admin_feedback,
        lp.created_at,
        mc.course_name,
        mc.default_course_code
      FROM lesson_plans lp
      LEFT JOIN master_courses mc ON mc.id = lp.course_mapping_id
      WHERE lp.faculty_id = ?
      ORDER BY lp.created_at DESC
    `,
    [facultyId]
  );

  return rows.map((row) => ({
    id: row.id,
    courseMappingId: row.course_mapping_id,
    facultyId: row.faculty_id,
    unitNumber: row.unit_number,
    lessonPlanNumber: row.lesson_plan_number,
    lessonPlanTitle: row.lesson_plan_title,
    pdfUrl: row.pdf_url,
    videoUrl: row.video_url,
    discourseUrl: row.discourse_url,
    status: row.status || "Pending",
    adminFeedback: row.admin_feedback || "",
    uploadedAt: row.created_at,
    course: row.course_name || "N/A",
    courseCode: row.default_course_code || "",
  }));
};

const getApprovedMaterialsByCourseCode = async (courseCode) => {
  const [rows] = await db.query(
    `
      SELECT
        lp.lesson_plan_number,
        lp.lesson_plan_title,
        lp.pdf_url,
        lp.video_url,
        lp.discourse_url
      FROM lesson_plans lp
      LEFT JOIN master_courses mc ON mc.id = lp.course_mapping_id
      WHERE lp.status = 'Approved'
        AND mc.default_course_code = ?
      ORDER BY lp.lesson_plan_number ASC
    `,
    [courseCode]
  );

  return rows.map((row) => ({
    lessonNumber: row.lesson_plan_number,
    lessonTitle: row.lesson_plan_title,
    pdfUrl: row.pdf_url || "",
    videoUrl: row.video_url || "",
    discourseUrl: row.discourse_url || "",
  }));
};

const updateLessonPlanStatus = async (id, status, reason) => {
  if (!id) {
    throw new Error("Lesson plan id is required");
  }
  if (!status) {
    throw new Error("Status is required");
  }

  const [rows] = await db.query(`SELECT * FROM lesson_plans WHERE id = ? LIMIT 1`, [id]);
  if (!rows.length) {
    throw new Error("Lesson plan not found");
  }

  const lessonPlan = rows[0];

  await db.query(
    `
      UPDATE lesson_plans
      SET status = ?, admin_feedback = ?
      WHERE id = ?
    `,
    [status, reason || null, id]
  );

  const message =
    status === "Approved"
      ? `Lesson plan "${lessonPlan.lesson_plan_title}" has been approved.`
      : `Lesson plan "${lessonPlan.lesson_plan_title}" was rejected. ${reason || ""}`.trim();

  await createFacultyNotification({
    facultyUserId: lessonPlan.faculty_id,
    message,
    status,
    adminResponse: reason || "",
    contextType: "material",
    sourceId: lessonPlan.id,
    complaintTitle: `LP ${lessonPlan.lesson_plan_number}: ${lessonPlan.lesson_plan_title}`,
    studentName: "Admin",
  });

  const [updatedRows] = await db.query(`SELECT * FROM lesson_plans WHERE id = ? LIMIT 1`, [id]);
  return updatedRows[0] || null;
};

module.exports = {
  initializeLessonPlanTables,
  createOrUpdateLessonPlan,
  getAllLessonPlans,
  getLessonPlansForFaculty,
  getApprovedMaterialsByCourseCode,
  updateLessonPlanStatus,
};
