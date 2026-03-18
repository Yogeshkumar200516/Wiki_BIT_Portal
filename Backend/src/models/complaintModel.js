const { db } = require("../config/config");

const COMPLAINT_SELECT = `
  SELECT
    c.id,
    c.student_user_id,
    c.title,
    c.category,
    c.description,
    c.photo_proof,
    c.status,
    c.admin_response,
    c.target_faculty_id,
    tf.name AS target_faculty_name,
    c.created_at,
    c.updated_at,
    mu.name AS student_name
  FROM complaints c
  LEFT JOIN master_users mu ON mu.user_id = c.student_user_id
  LEFT JOIN master_users tf ON tf.user_id = c.target_faculty_id
`;

const formatComplaint = (row) => ({
  id: row.id,
  studentId: row.student_user_id,
  studentName: row.student_name || row.student_user_id,
  title: row.title,
  category: row.category,
  description: row.description,
  photoProof: row.photo_proof || null,
  status: row.status,
  adminResponse: row.admin_response || "",
  targetFacultyId: row.target_faculty_id || "",
  facultyId: row.target_faculty_id || "",
  facultyName: row.target_faculty_name || "",
  date: row.created_at ? row.created_at.toISOString().slice(0, 10) : null,
  updatedAt: row.updated_at || null,
});

const getTableColumns = async (tableName) => {
  const [rows] = await db.query(`SHOW COLUMNS FROM ${tableName}`);
  return rows.map((row) => row.Field);
};

const getTableColumnInfo = async (tableName) => {
  const [rows] = await db.query(`SHOW COLUMNS FROM ${tableName}`);
  return rows;
};

const isNumericSqlType = (sqlType) =>
  /int|bigint|smallint|tinyint|mediumint|decimal|numeric|float|double/i.test(sqlType || "");
const isDateSqlType = (sqlType) => /date|time|timestamp|datetime/i.test(sqlType || "");
const parseSqlEnumValues = (sqlType) => {
  const match = (sqlType || "").match(/^(enum|set)\((.*)\)$/i);
  if (!match) return [];
  const rawValues = match[2];
  const valueMatches = rawValues.match(/'((?:\\'|[^'])*)'/g) || [];
  return valueMatches.map((value) => value.slice(1, -1).replace(/\\'/g, "'"));
};

const ensureColumnExists = async (tableName, columnName, definition) => {
  const columns = await getTableColumns(tableName);
  if (!columns.includes(columnName)) {
    await db.query(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`);
  }
};

const getFacultyIdentityColumns = async (tableName) => {
  const columnInfo = await getTableColumnInfo(tableName);
  const identityColumns = columnInfo
    .filter((column) => ["faculty_user_id", "faculty_id"].includes(column.Field))
    .map((column) => ({
      name: column.Field,
      numeric: isNumericSqlType(column.Type),
    }))
    .sort((a, b) => {
      if (a.name === "faculty_user_id") return -1;
      if (b.name === "faculty_user_id") return 1;
      return 0;
    });

  if (!identityColumns.length) {
    throw new Error(`${tableName} table is missing faculty user column`);
  }

  return identityColumns;
};

const getFacultyIdentifiers = async (facultyUserId) => {
  const [rows] = await db.query(
    `
      SELECT id, user_id
      FROM master_users
      WHERE user_id = ? OR CAST(id AS CHAR) = ?
      LIMIT 1
    `,
    [facultyUserId, facultyUserId]
  );

  if (!rows.length) {
    return {
      userId: facultyUserId,
      numericId: Number.isFinite(Number(facultyUserId)) ? Number(facultyUserId) : null,
    };
  }

  return {
    userId: rows[0].user_id,
    numericId: rows[0].id,
  };
};

const getValueForIdentityColumn = (column, identifiers) => {
  if (column.numeric) {
    if (identifiers.numericId === null || identifiers.numericId === undefined) {
      throw new Error(`Unable to resolve numeric faculty id for column ${column.name}`);
    }
    return identifiers.numericId;
  }
  return identifiers.userId;
};

const getFacultyCourseContext = async (facultyUserId) => {
  const [rows] = await db.query(
    `
      SELECT course_mapping_id, incharge_faculty_id, wetting_faculty_ids
      FROM faculty_courses
      WHERE incharge_faculty_id = ?
         OR JSON_CONTAINS(wetting_faculty_ids, JSON_QUOTE(?), '$')
      ORDER BY id DESC
      LIMIT 1
    `,
    [facultyUserId, facultyUserId]
  );

  if (rows.length) {
    const row = rows[0];
    const role =
      row.incharge_faculty_id === facultyUserId ? "Incharge" : "Wetted Faculty";
    return {
      courseMappingId: row.course_mapping_id,
      role,
    };
  }

  const [fallbackCourse] = await db.query(
    `SELECT id AS course_mapping_id FROM master_courses ORDER BY id ASC LIMIT 1`
  );

  return {
    courseMappingId: fallbackCourse.length ? fallbackCourse[0].course_mapping_id : 0,
    role: "Wetted Faculty",
  };
};

const getFallbackValueForColumn = (column, context = {}) => {
  const field = column.Field;
  const type = column.Type || "";

  if (context[field] !== undefined) return context[field];
  if (field === "role") return context.role || "Wetted Faculty";
  if (field === "course_mapping_id") return context.course_mapping_id || 0;
  if (field === "complaint_id") return context.complaint_id || 0;
  if (field === "complaint_title") return context.complaint_title || "";
  if (field === "student_name") return context.student_name || "";
  if (field === "message") return context.message || "";
  if (field === "score") return context.score ?? 99;
  if (field === "is_read") return context.is_read ?? 0;
  if (field === "status") return context.status || "Approved";
  if (field === "created_at" || field === "updated_at") return new Date();

  if (isNumericSqlType(type)) return 0;
  if (isDateSqlType(type)) return new Date();

  const enumValues = parseSqlEnumValues(type);
  if (enumValues.length) {
    if (field === "role" && enumValues.includes("Faculty")) return "Faculty";
    return enumValues[0];
  }

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

    if (isRequired && !isAutoIncrement && !alreadySet) {
      columns.push(column.Field);
      values.push(getFallbackValueForColumn(column, context));
    }
  }

  return { columns, values };
};

const initializeComplaintTables = async () => {
  await db.query(`
    CREATE TABLE IF NOT EXISTS complaints (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      student_user_id VARCHAR(255) NOT NULL,
      title VARCHAR(255) NOT NULL,
      category ENUM('Academic', 'Faculty', 'Technical', 'Other') NOT NULL,
      description TEXT NOT NULL,
      photo_proof LONGTEXT NULL,
      status ENUM('Pending', 'Approved', 'Rejected') NOT NULL DEFAULT 'Pending',
      admin_response TEXT NULL,
      target_faculty_id VARCHAR(255) NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_complaints_student (student_user_id),
      INDEX idx_complaints_status (status),
      INDEX idx_complaints_target_faculty (target_faculty_id)
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS faculty_scores (
      faculty_user_id VARCHAR(255) PRIMARY KEY,
      score INT NOT NULL DEFAULT 100,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS faculty_notifications (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      faculty_user_id VARCHAR(255) NOT NULL,
      complaint_id BIGINT UNSIGNED NOT NULL,
      complaint_title VARCHAR(255) NOT NULL,
      student_name VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      status VARCHAR(40) NULL,
      admin_response TEXT NULL,
      context_type VARCHAR(40) NULL,
      source_id BIGINT NULL,
      is_read TINYINT(1) NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_notifications_faculty (faculty_user_id),
      INDEX idx_notifications_read (is_read)
    )
  `);

  // Backward-compatible migration for older table variants.
  await ensureColumnExists("complaints", "target_faculty_id", "VARCHAR(255) NULL");
  await ensureColumnExists("complaints", "admin_response", "TEXT NULL");

  await ensureColumnExists("faculty_scores", "faculty_user_id", "VARCHAR(255) NULL");
  await ensureColumnExists("faculty_scores", "faculty_id", "BIGINT NULL");

  await ensureColumnExists("faculty_notifications", "faculty_user_id", "VARCHAR(255) NULL");
  await ensureColumnExists("faculty_notifications", "faculty_id", "BIGINT NULL");
  await ensureColumnExists("faculty_notifications", "complaint_id", "BIGINT UNSIGNED NULL");
  await ensureColumnExists("faculty_notifications", "complaint_title", "VARCHAR(255) NULL");
  await ensureColumnExists("faculty_notifications", "student_name", "VARCHAR(255) NULL");
  await ensureColumnExists("faculty_notifications", "message", "TEXT NULL");
  await ensureColumnExists("faculty_notifications", "status", "VARCHAR(40) NULL");
  await ensureColumnExists("faculty_notifications", "admin_response", "TEXT NULL");
  await ensureColumnExists("faculty_notifications", "context_type", "VARCHAR(40) NULL");
  await ensureColumnExists("faculty_notifications", "source_id", "BIGINT NULL");
  await ensureColumnExists("faculty_notifications", "is_read", "TINYINT(1) NOT NULL DEFAULT 0");
  await ensureColumnExists("faculty_notifications", "created_at", "TIMESTAMP DEFAULT CURRENT_TIMESTAMP");
};

const getComplaintsForStudent = async (studentUserId) => {
  const [rows] = await db.query(
    `${COMPLAINT_SELECT} WHERE c.student_user_id = ? ORDER BY c.created_at DESC`,
    [studentUserId]
  );
  return rows.map(formatComplaint);
};

const getAllComplaints = async () => {
  const [rows] = await db.query(`${COMPLAINT_SELECT} ORDER BY c.created_at DESC`);
  return rows.map(formatComplaint);
};

const createComplaint = async ({
  studentUserId,
  facultyId,
  title,
  category,
  description,
  photoProof,
}) => {
  const [result] = await db.query(
    `
      INSERT INTO complaints (student_user_id, target_faculty_id, title, category, description, photo_proof)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    [studentUserId, facultyId, title, category, description, photoProof || null]
  );

  const [rows] = await db.query(`${COMPLAINT_SELECT} WHERE c.id = ?`, [result.insertId]);
  return rows.length ? formatComplaint(rows[0]) : null;
};

const reviewComplaint = async ({ complaintId, decision, reason, targetFacultyId }) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const [rows] = await connection.query(
      `
        SELECT c.*, mu.name AS student_name
        FROM complaints c
        LEFT JOIN master_users mu ON mu.user_id = c.student_user_id
        WHERE c.id = ?
        FOR UPDATE
      `,
      [complaintId]
    );

    if (!rows.length) {
      throw new Error("Complaint not found");
    }

    const complaint = rows[0];

    const resolvedFacultyId = targetFacultyId || complaint.target_faculty_id || null;

    await connection.query(
      `
        UPDATE complaints
        SET status = ?, admin_response = ?, target_faculty_id = ?
        WHERE id = ?
      `,
      [decision, reason, resolvedFacultyId, complaintId]
    );

    if (decision === "Approved" && resolvedFacultyId) {
      const facultyIdentifiers = await getFacultyIdentifiers(resolvedFacultyId);
      const facultyCourseContext = await getFacultyCourseContext(
        facultyIdentifiers.userId
      );
      const facultyScoreUserColumns = await getFacultyIdentityColumns("faculty_scores");
      const facultyNotificationUserColumns = await getFacultyIdentityColumns(
        "faculty_notifications"
      );

      const scoreValueMap = {
        ...Object.fromEntries(
          facultyScoreUserColumns.map((column) => [
            column.name,
            getValueForIdentityColumn(column, facultyIdentifiers),
          ])
        ),
        score: 99,
      };
      const scoreInsertPayload = await buildInsertPayload("faculty_scores", scoreValueMap, {
        score: 99,
      });
      const scoreInsertColumns = scoreInsertPayload.columns;
      const scoreInsertPlaceholders = scoreInsertColumns.map(() => "?").join(", ");
      const scoreInsertValues = scoreInsertPayload.values;

      await connection.query(
        `
          INSERT INTO faculty_scores (${scoreInsertColumns.join(", ")})
          VALUES (${scoreInsertPlaceholders})
          ON DUPLICATE KEY UPDATE score = GREATEST(0, score - 1)
        `,
        scoreInsertValues
      );

      const studentName = complaint.student_name || complaint.student_user_id;
      const message = `A complaint titled "${complaint.title}" has been approved by admin. Your score was reduced by 1.`;
      const notificationValueMap = {
        ...Object.fromEntries(
          facultyNotificationUserColumns.map((column) => [
            column.name,
            getValueForIdentityColumn(column, facultyIdentifiers),
          ])
        ),
        complaint_id: complaintId,
        complaint_title: complaint.title,
        student_name: studentName,
        message,
      };
      const notificationInsertPayload = await buildInsertPayload(
        "faculty_notifications",
        notificationValueMap,
        {
          complaint_id: complaintId,
          complaint_title: complaint.title,
          student_name: studentName,
          message,
          role: facultyCourseContext.role,
          course_mapping_id: facultyCourseContext.courseMappingId || 0,
          is_read: 0,
        }
      );
      const notificationInsertColumns = notificationInsertPayload.columns;
      const notificationInsertValues = notificationInsertPayload.values;
      const notificationInsertPlaceholders = notificationInsertColumns
        .map(() => "?")
        .join(", ");

      await connection.query(
        `
          INSERT INTO faculty_notifications
          (${notificationInsertColumns.join(", ")})
          VALUES (${notificationInsertPlaceholders})
        `,
        notificationInsertValues
      );
    }

    await connection.commit();

    const [updatedRows] = await db.query(`${COMPLAINT_SELECT} WHERE c.id = ?`, [complaintId]);
    return updatedRows.length ? formatComplaint(updatedRows[0]) : null;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

const getFacultyScores = async () => {
  const facultyScoreUserColumns = await getFacultyIdentityColumns("faculty_scores");
  const scoreJoinCondition = facultyScoreUserColumns
    .map((column) => `fs.${column.name} = ${column.numeric ? "mu.id" : "mu.user_id"}`)
    .join(" OR ");

  const [rows] = await db.query(`
    SELECT
      mu.user_id AS id,
      mu.name,
      md.department_name AS department,
      COALESCE(fs.score, 100) AS score
    FROM master_users mu
    LEFT JOIN master_departments md ON md.id = mu.department_id
    LEFT JOIN faculty_scores fs ON (${scoreJoinCondition})
    WHERE mu.role = 'Faculty'
    ORDER BY mu.name ASC
  `);

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    department: row.department || "N/A",
    score: Number(row.score),
  }));
};

const getFacultyNotifications = async (facultyUserId) => {
  const facultyIdentifiers = await getFacultyIdentifiers(facultyUserId);
  const facultyNotificationUserColumns = await getFacultyIdentityColumns("faculty_notifications");
  const notificationFacultyExpr = facultyNotificationUserColumns
    .map((column) => `fn.${column.name}`)
    .join(", ");
  const notificationFilter = facultyNotificationUserColumns
    .map((column) => `fn.${column.name} = ?`)
    .join(" OR ");
  const notificationFilterValues = facultyNotificationUserColumns.map((column) =>
    getValueForIdentityColumn(column, facultyIdentifiers)
  );

  const [rows] = await db.query(
    `
      SELECT
        fn.id,
        COALESCE(${notificationFacultyExpr}) AS faculty_user_id,
        fn.complaint_id,
        fn.complaint_title,
        fn.student_name,
        fn.message,
        fn.is_read,
        fn.created_at,
        COALESCE(fn.status, c.status) AS status,
        COALESCE(fn.admin_response, c.admin_response) AS admin_response,
        fn.context_type,
        fn.source_id
      FROM faculty_notifications fn
      LEFT JOIN complaints c ON c.id = fn.complaint_id
      WHERE ${notificationFilter}
      ORDER BY fn.created_at DESC
    `,
    notificationFilterValues
  );

  return rows.map((row) => ({
    id: row.id,
    facultyId: facultyUserId,
    complaintId: row.complaint_id,
    complaintTitle: row.complaint_title,
    studentName: row.student_name,
    message: row.message,
    status: row.status || "Approved",
    adminResponse: row.admin_response || "",
    read: Boolean(row.is_read),
    timestamp: row.created_at ? row.created_at.toISOString() : null,
    contextType: row.context_type || "complaint",
    sourceId: row.source_id || null,
  }));
};

const markNotificationRead = async (notificationId) => {
  await db.query(`UPDATE faculty_notifications SET is_read = 1 WHERE id = ?`, [notificationId]);
};

const markAllNotificationsRead = async (facultyUserId) => {
  const facultyIdentifiers = await getFacultyIdentifiers(facultyUserId);
  const facultyNotificationUserColumns = await getFacultyIdentityColumns("faculty_notifications");
  const markReadFilter = facultyNotificationUserColumns
    .map((column) => `${column.name} = ?`)
    .join(" OR ");
  const markReadValues = facultyNotificationUserColumns.map((column) =>
    getValueForIdentityColumn(column, facultyIdentifiers)
  );

  await db.query(
    `UPDATE faculty_notifications SET is_read = 1 WHERE (${markReadFilter}) AND is_read = 0`,
    markReadValues
  );
};

const createFacultyNotification = async ({
  facultyUserId,
  message,
  status,
  adminResponse,
  contextType,
  sourceId,
  complaintTitle,
  studentName,
}) => {
  const facultyIdentifiers = await getFacultyIdentifiers(facultyUserId);
  const facultyCourseContext = await getFacultyCourseContext(facultyIdentifiers.userId);
  const facultyNotificationUserColumns = await getFacultyIdentityColumns("faculty_notifications");

  const notificationValueMap = {
    ...Object.fromEntries(
      facultyNotificationUserColumns.map((column) => [
        column.name,
        getValueForIdentityColumn(column, facultyIdentifiers),
      ])
    ),
    complaint_id: sourceId ?? 0,
    complaint_title: complaintTitle || "Notification",
    student_name: studentName || "Admin",
    message: message || "",
    status: status || null,
    admin_response: adminResponse || null,
    context_type: contextType || "general",
    source_id: sourceId ?? null,
  };

  const notificationInsertPayload = await buildInsertPayload(
    "faculty_notifications",
    notificationValueMap,
    {
      complaint_id: sourceId ?? 0,
      complaint_title: complaintTitle || "Notification",
      student_name: studentName || "Admin",
      message: message || "",
      status: status || null,
      admin_response: adminResponse || null,
      context_type: contextType || "general",
      source_id: sourceId ?? null,
      role: facultyCourseContext.role,
      course_mapping_id: facultyCourseContext.courseMappingId || 0,
      is_read: 0,
    }
  );

  const notificationInsertColumns = notificationInsertPayload.columns;
  const notificationInsertValues = notificationInsertPayload.values;
  const notificationInsertPlaceholders = notificationInsertColumns.map(() => "?").join(", ");

  await db.query(
    `
      INSERT INTO faculty_notifications
      (${notificationInsertColumns.join(", ")})
      VALUES (${notificationInsertPlaceholders})
    `,
    notificationInsertValues
  );
};

module.exports = {
  initializeComplaintTables,
  getComplaintsForStudent,
  getAllComplaints,
  createComplaint,
  reviewComplaint,
  getFacultyScores,
  getFacultyNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  createFacultyNotification,
};
