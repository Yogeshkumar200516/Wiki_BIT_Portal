const { db } = require("../config/config");

const COURSE_SEED = [];

const pushCourse = (department, semester, courseType, courseId, courseName, L = 3, T = 0, P = 0, C = 3) => {
  COURSE_SEED.push({
    course_id: courseId,
    course_name: courseName,
    department,
    semester,
    course_type: courseType,
    L,
    T,
    P,
    C,
  });
};

const addBatch = (department, semester, courseType, list) => {
  list.forEach(([code, name, L, T, P, C]) => {
    pushCourse(department, semester, courseType, code, name, L, T, P, C);
  });
};

const hasColumn = async (tableName, columnName) => {
  const [rows] = await db.query(`SHOW COLUMNS FROM ${tableName} LIKE ?`, [columnName]);
  return rows.length > 0;
};

const getMasterCoursesByDepartmentSemester = async (department, semester) => {
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

  const [rows] = await db.query(
    `
      SELECT
        mc.default_course_code AS course_id,
        mc.course_name AS course_name,
        UPPER(${departmentExpr}) AS department,
        CAST(${semesterExpr} AS UNSIGNED) AS semester,
        ${courseTypeExpr} AS course_type,
        COALESCE(mc.lecture_credits, 0) AS L,
        COALESCE(mc.theory_credits, 0) AS T,
        COALESCE(mc.practical_credits, 0) AS P,
        COALESCE(mc.total_credits, 0) AS C
      FROM master_courses mc
      WHERE UPPER(${departmentExpr}) = ? AND CAST(${semesterExpr} AS UNSIGNED) = ?
      ORDER BY mc.default_course_code ASC
    `,
    [String(department || "").toUpperCase(), Number(semester)]
  );

  return rows.map((row) => ({
    courseId: row.course_id,
    courseName: row.course_name,
    department: row.department,
    semester: Number(row.semester),
    courseType: row.course_type,
    L: Number(row.L || 0),
    T: Number(row.T || 0),
    P: Number(row.P || 0),
    C: Number(row.C || 0),
  }));
};

// CS
addBatch("CS", 1, "Core", [
  ["MA101", "Engineering Mathematics I", 3, 1, 0, 4],
  ["PH101", "Engineering Physics", 3, 0, 2, 4],
  ["CY101", "Engineering Chemistry", 3, 0, 2, 4],
  ["CS101", "Problem Solving & Python Programming", 3, 0, 2, 4],
  ["ME101", "Engineering Graphics", 2, 0, 4, 4],
  ["EE101", "Basic Electrical & Electronics Engineering", 3, 0, 2, 4],
  ["HS101", "Communicative English", 2, 0, 2, 3],
]);
addBatch("CS", 2, "Core", [
  ["MA201", "Engineering Mathematics II", 3, 1, 0, 4],
  ["CS201", "Data Structures", 3, 0, 2, 4],
  ["CS202", "Digital Principles & System Design", 3, 0, 2, 4],
  ["CS203", "Object Oriented Programming in C++", 3, 0, 2, 4],
  ["EC201", "Electronic Devices & Circuits", 3, 0, 2, 4],
  ["HS201", "Technical Writing & Presentation Skills", 2, 0, 2, 3],
  ["CS204", "Engineering Practices Laboratory", 0, 0, 4, 2],
]);
addBatch("CS", 3, "Core", [
  ["MA301", "Probability & Statistics", 3, 1, 0, 4],
  ["CS301", "Computer Organization & Architecture", 3, 0, 2, 4],
  ["CS302", "Design & Analysis of Algorithms", 3, 1, 0, 4],
  ["CS303", "Operating Systems", 3, 0, 2, 4],
  ["CS304", "Database Management Systems", 3, 0, 2, 4],
  ["CS305", "Discrete Mathematics", 3, 1, 0, 4],
]);
addBatch("CS", 3, "Elective", [
  ["CS351", "Web Technologies", 3, 0, 0, 3],
  ["CS352", "Mobile Application Development", 3, 0, 0, 3],
]);
addBatch("CS", 4, "Core", [
  ["MA401", "Numerical Methods", 3, 1, 0, 4],
  ["CS401", "Computer Networks", 3, 0, 2, 4],
  ["CS402", "Theory of Computation", 3, 1, 0, 4],
  ["CS403", "Software Engineering", 3, 0, 0, 3],
  ["CS404", "Microprocessors & Microcontrollers", 3, 0, 2, 4],
  ["CS405", "Object Oriented Analysis & Design", 3, 0, 0, 3],
]);
addBatch("CS", 4, "Elective", [
  ["CS451", "Internet of Things", 3, 0, 0, 3],
  ["CS452", "Embedded Systems", 3, 0, 0, 3],
  ["CS453", "Human Computer Interaction", 3, 0, 0, 3],
]);
addBatch("CS", 5, "Core", [
  ["CS501", "Compiler Design", 3, 1, 0, 4],
  ["CS502", "Artificial Intelligence", 3, 0, 2, 4],
  ["CS503", "Cryptography & Network Security", 3, 0, 0, 3],
  ["CS504", "Cloud Computing", 3, 0, 2, 4],
  ["CS505", "Data Warehousing & Mining", 3, 0, 0, 3],
]);
addBatch("CS", 5, "Elective", [
  ["CS551", "Natural Language Processing", 3, 0, 0, 3],
  ["CS552", "Image Processing & Computer Vision", 3, 0, 0, 3],
  ["CS553", "Distributed Computing", 3, 0, 0, 3],
  ["CS554", "Game Development & Design", 3, 0, 0, 3],
]);
addBatch("CS", 6, "Core", [
  ["CS601", "Machine Learning", 3, 0, 2, 4],
  ["CS602", "Distributed Systems", 3, 0, 0, 3],
  ["CS603", "Big Data Analytics", 3, 0, 2, 4],
  ["CS604", "Software Testing & Quality Assurance", 3, 0, 2, 4],
  ["CS605", "Information Retrieval Techniques", 3, 0, 0, 3],
]);
addBatch("CS", 6, "Elective", [
  ["CS651", "Data Visualization", 3, 0, 0, 3],
  ["CS652", "Blockchain Technology", 3, 0, 0, 3],
  ["CS653", "Augmented & Virtual Reality", 3, 0, 0, 3],
  ["CS654", "Quantum Computing", 3, 0, 0, 3],
]);
addBatch("CS", 7, "Core", [
  ["CS701", "Deep Learning", 3, 0, 2, 4],
  ["CS702", "Cyber Security & Digital Forensics", 3, 0, 2, 4],
  ["CS703", "DevOps & Agile Methodologies", 3, 0, 0, 3],
  ["CS704", "Project Work Phase I", 0, 0, 6, 3],
]);
addBatch("CS", 7, "Elective", [
  ["CS751", "Autonomous Systems & Robotics", 3, 0, 0, 3],
  ["CS752", "Edge Computing", 3, 0, 0, 3],
  ["CS753", "Advanced Database Systems", 3, 0, 0, 3],
  ["CS754", "High Performance Computing", 3, 0, 0, 3],
]);
addBatch("CS", 8, "Core", [
  ["CS801", "Project Work Phase II", 0, 0, 12, 6],
  ["CS802", "Professional Ethics & IPR", 2, 0, 0, 2],
  ["CS803", "Entrepreneurship Development", 2, 0, 0, 2],
]);
addBatch("CS", 8, "Elective", [
  ["CS851", "Generative AI & Large Language Models", 3, 0, 0, 3],
  ["CS852", "Digital Twins & Simulation", 3, 0, 0, 3],
  ["CS853", "5G & Next Generation Networks", 3, 0, 0, 3],
  ["CS854", "Computational Intelligence", 3, 0, 0, 3],
]);

// ME
addBatch("ME", 1, "Core", [
  ["MA101", "Engineering Mathematics I", 3, 1, 0, 4],
  ["PH101", "Engineering Physics", 3, 0, 2, 4],
  ["CY101", "Engineering Chemistry", 3, 0, 2, 4],
  ["ME101", "Engineering Graphics", 2, 0, 4, 4],
  ["EE101", "Basic Electrical Engineering", 3, 0, 2, 4],
  ["HS101", "Communicative English", 2, 0, 2, 3],
]);
addBatch("ME", 2, "Core", [
  ["MA201", "Engineering Mathematics II", 3, 1, 0, 4],
  ["ME201", "Engineering Mechanics", 3, 0, 0, 3],
  ["ME202", "Material Science & Metallurgy", 3, 0, 0, 3],
  ["ME203", "Thermal Engineering", 3, 0, 2, 4],
  ["ME204", "Manufacturing Processes", 3, 0, 2, 4],
  ["ME205", "Engineering Practices Lab", 0, 0, 4, 2],
]);
addBatch("ME", 3, "Core", [
  ["ME301", "Thermodynamics", 3, 1, 0, 4],
  ["ME302", "Fluid Mechanics", 3, 0, 2, 4],
  ["ME303", "Manufacturing Process", 3, 0, 2, 4],
  ["ME304", "Engineering Mechanics", 3, 0, 0, 3],
]);
addBatch("ME", 3, "Elective", [
  ["ME351", "Industrial Safety", 3, 0, 0, 3],
  ["ME352", "CAD Fundamentals", 3, 0, 0, 3],
]);
addBatch("ME", 4, "Core", [
  ["ME401", "Kinematics of Machinery", 3, 0, 0, 3],
  ["ME402", "Machine Design I", 3, 1, 0, 4],
  ["ME403", "Heat & Mass Transfer", 3, 0, 2, 4],
  ["ME404", "Manufacturing Technology", 3, 0, 2, 4],
]);
addBatch("ME", 4, "Elective", [
  ["ME451", "Additive Manufacturing", 3, 0, 0, 3],
  ["ME452", "Industrial Robotics", 3, 0, 0, 3],
]);
addBatch("ME", 5, "Core", [
  ["ME501", "Dynamics of Machinery", 3, 0, 0, 3],
  ["ME502", "Design of Transmission Systems", 3, 0, 2, 4],
  ["ME503", "Finite Element Analysis", 3, 0, 0, 3],
  ["ME504", "Metrology & Measurements", 3, 0, 2, 4],
]);
addBatch("ME", 5, "Elective", [
  ["ME551", "Renewable Energy Systems", 3, 0, 0, 3],
  ["ME552", "Automotive Engineering", 3, 0, 0, 3],
]);
addBatch("ME", 6, "Core", [
  ["ME601", "Heat Exchangers", 3, 0, 0, 3],
  ["ME602", "CAD/CAM", 3, 0, 2, 4],
  ["ME603", "Quality Control", 3, 0, 0, 3],
  ["ME604", "Mechatronics", 3, 0, 2, 4],
]);
addBatch("ME", 6, "Elective", [
  ["ME651", "Industrial Engineering", 3, 0, 0, 3],
  ["ME652", "Product Design", 3, 0, 0, 3],
]);
addBatch("ME", 7, "Core", [
  ["ME701", "Machine Design II", 3, 0, 0, 3],
  ["ME702", "Refrigeration & Air Conditioning", 3, 0, 2, 4],
  ["ME703", "Automobile Engineering", 3, 0, 0, 3],
  ["ME704", "Project Work Phase I", 0, 0, 6, 3],
]);
addBatch("ME", 7, "Elective", [
  ["ME751", "Energy Management", 3, 0, 0, 3],
  ["ME752", "Advanced Manufacturing", 3, 0, 0, 3],
]);
addBatch("ME", 8, "Core", [
  ["ME801", "Project Work Phase II", 0, 0, 12, 6],
  ["ME802", "Professional Ethics", 2, 0, 0, 2],
  ["ME803", "Entrepreneurship Development", 2, 0, 0, 2],
]);
addBatch("ME", 8, "Elective", [
  ["ME851", "Hybrid Vehicles", 3, 0, 0, 3],
  ["ME852", "Smart Manufacturing", 3, 0, 0, 3],
]);

// ECE
addBatch("ECE", 1, "Core", [
  ["MA101", "Engineering Mathematics I", 3, 1, 0, 4],
  ["PH101", "Engineering Physics", 3, 0, 2, 4],
  ["CY101", "Engineering Chemistry", 3, 0, 2, 4],
  ["EC101", "Circuit Theory", 3, 0, 2, 4],
  ["EE101", "Basic Electrical Engineering", 3, 0, 2, 4],
  ["HS101", "Communicative English", 2, 0, 2, 3],
]);
addBatch("ECE", 2, "Core", [
  ["MA201", "Engineering Mathematics II", 3, 1, 0, 4],
  ["EC201", "Electronic Devices & Circuits", 3, 0, 2, 4],
  ["EC202", "Signals and Systems", 3, 0, 0, 3],
  ["EC203", "Digital Logic Design", 3, 0, 2, 4],
  ["EC204", "Network Theory", 3, 0, 0, 3],
  ["EC205", "Programming in C", 3, 0, 2, 4],
]);
addBatch("ECE", 3, "Core", [
  ["EC301", "Analog Communication", 3, 0, 2, 4],
  ["EC302", "Electromagnetic Theory", 3, 1, 0, 4],
  ["EC303", "Linear Integrated Circuits", 3, 0, 2, 4],
  ["EC304", "Control Systems", 3, 0, 0, 3],
]);
addBatch("ECE", 3, "Elective", [
  ["EC351", "VLSI Fundamentals", 3, 0, 0, 3],
  ["EC352", "IoT Systems", 3, 0, 0, 3],
]);
addBatch("ECE", 4, "Core", [
  ["EC401", "Digital Signal Processing", 3, 0, 2, 4],
  ["EC402", "Microprocessors & Microcontrollers", 3, 0, 2, 4],
  ["EC403", "Communication Systems", 3, 0, 0, 3],
  ["EC404", "Antenna & Wave Propagation", 3, 0, 0, 3],
]);
addBatch("ECE", 4, "Elective", [
  ["EC451", "Embedded Systems", 3, 0, 0, 3],
  ["EC452", "RF Circuit Design", 3, 0, 0, 3],
]);
addBatch("ECE", 5, "Core", [
  ["EC501", "Computer Networks", 3, 0, 0, 3],
  ["EC502", "Optical Communication", 3, 0, 0, 3],
  ["EC503", "Digital Communication", 3, 0, 2, 4],
  ["EC504", "VLSI Design", 3, 0, 2, 4],
]);
addBatch("ECE", 5, "Elective", [
  ["EC551", "Wireless Sensor Networks", 3, 0, 0, 3],
  ["EC552", "Biomedical Instrumentation", 3, 0, 0, 3],
]);
addBatch("ECE", 6, "Core", [
  ["EC601", "Satellite Communication", 3, 0, 0, 3],
  ["EC602", "DSP Architecture", 3, 0, 0, 3],
  ["EC603", "Advanced VLSI", 3, 0, 0, 3],
  ["EC604", "Digital Image Processing", 3, 0, 2, 4],
]);
addBatch("ECE", 6, "Elective", [
  ["EC651", "Machine Learning for Signal Processing", 3, 0, 0, 3],
  ["EC652", "Embedded AI", 3, 0, 0, 3],
]);
addBatch("ECE", 7, "Core", [
  ["EC701", "Microwave Engineering", 3, 0, 0, 3],
  ["EC702", "Network Security", 3, 0, 0, 3],
  ["EC703", "Project Work Phase I", 0, 0, 6, 3],
  ["EC704", "Industrial Automation", 3, 0, 0, 3],
]);
addBatch("ECE", 7, "Elective", [
  ["EC751", "5G Communication", 3, 0, 0, 3],
  ["EC752", "Autonomous Embedded Systems", 3, 0, 0, 3],
]);
addBatch("ECE", 8, "Core", [
  ["EC801", "Project Work Phase II", 0, 0, 12, 6],
  ["EC802", "Professional Ethics", 2, 0, 0, 2],
  ["EC803", "Entrepreneurship Development", 2, 0, 0, 2],
]);
addBatch("ECE", 8, "Elective", [
  ["EC851", "Advanced DSP", 3, 0, 0, 3],
  ["EC852", "IoT Security", 3, 0, 0, 3],
]);

// EEE
addBatch("EEE", 1, "Core", [
  ["MA101", "Engineering Mathematics I", 3, 1, 0, 4],
  ["PH101", "Engineering Physics", 3, 0, 2, 4],
  ["CY101", "Engineering Chemistry", 3, 0, 2, 4],
  ["EE101", "Circuit Theory", 3, 0, 2, 4],
  ["EE102", "Electrical Machines I", 3, 0, 2, 4],
  ["HS101", "Communicative English", 2, 0, 2, 3],
]);
addBatch("EEE", 2, "Core", [
  ["MA201", "Engineering Mathematics II", 3, 1, 0, 4],
  ["EE201", "Electrical Machines II", 3, 0, 2, 4],
  ["EE202", "Analog Electronics", 3, 0, 2, 4],
  ["EE203", "Electromagnetic Fields", 3, 0, 0, 3],
  ["EE204", "Network Analysis", 3, 0, 0, 3],
  ["EE205", "Programming in C", 3, 0, 2, 4],
]);
addBatch("EEE", 3, "Core", [
  ["EE301", "Power Systems I", 3, 0, 0, 3],
  ["EE302", "Control Systems", 3, 0, 0, 3],
  ["EE303", "Electrical Measurements", 3, 0, 2, 4],
  ["EE304", "Power Electronics", 3, 0, 2, 4],
]);
addBatch("EEE", 3, "Elective", [
  ["EE351", "Renewable Energy Technology", 3, 0, 0, 3],
  ["EE352", "Smart Grid Fundamentals", 3, 0, 0, 3],
]);
addBatch("EEE", 4, "Core", [
  ["EE401", "Power Systems II", 3, 0, 0, 3],
  ["EE402", "Electrical Machines III", 3, 0, 2, 4],
  ["EE403", "Microprocessors", 3, 0, 2, 4],
  ["EE404", "Signals & Systems", 3, 0, 0, 3],
]);
addBatch("EEE", 4, "Elective", [
  ["EE451", "Industrial Drives", 3, 0, 0, 3],
  ["EE452", "Energy Audit", 3, 0, 0, 3],
]);
addBatch("EEE", 5, "Core", [
  ["EE501", "Power System Protection", 3, 0, 0, 3],
  ["EE502", "High Voltage Engineering", 3, 0, 0, 3],
  ["EE503", "Electric Drives", 3, 0, 2, 4],
  ["EE504", "Instrumentation", 3, 0, 2, 4],
]);
addBatch("EEE", 5, "Elective", [
  ["EE551", "Power Quality", 3, 0, 0, 3],
  ["EE552", "Electric Vehicles", 3, 0, 0, 3],
]);
addBatch("EEE", 6, "Core", [
  ["EE601", "Renewable Energy Systems", 3, 0, 0, 3],
  ["EE602", "Embedded Systems", 3, 0, 2, 4],
  ["EE603", "Digital Signal Processing", 3, 0, 2, 4],
  ["EE604", "Power Electronics Applications", 3, 0, 0, 3],
]);
addBatch("EEE", 6, "Elective", [
  ["EE651", "Smart Grid Technology", 3, 0, 0, 3],
  ["EE652", "Energy Storage Systems", 3, 0, 0, 3],
]);
addBatch("EEE", 7, "Core", [
  ["EE701", "Power System Operation", 3, 0, 0, 3],
  ["EE702", "Advanced Control Systems", 3, 0, 0, 3],
  ["EE703", "Project Work Phase I", 0, 0, 6, 3],
  ["EE704", "Electrical Drives & Traction", 3, 0, 0, 3],
]);
addBatch("EEE", 7, "Elective", [
  ["EE751", "Power Plant Engineering", 3, 0, 0, 3],
  ["EE752", "Smart Electric Grids", 3, 0, 0, 3],
]);
addBatch("EEE", 8, "Core", [
  ["EE801", "Project Work Phase II", 0, 0, 12, 6],
  ["EE802", "Professional Ethics", 2, 0, 0, 2],
  ["EE803", "Entrepreneurship Development", 2, 0, 0, 2],
]);
addBatch("EEE", 8, "Elective", [
  ["EE851", "Power System Economics", 3, 0, 0, 3],
  ["EE852", "Energy Policy & Regulations", 3, 0, 0, 3],
]);

// CIVIL
addBatch("CIVIL", 1, "Core", [
  ["MA101", "Engineering Mathematics I", 3, 1, 0, 4],
  ["PH101", "Engineering Physics", 3, 0, 2, 4],
  ["CY101", "Engineering Chemistry", 3, 0, 2, 4],
  ["CE101", "Engineering Drawing", 2, 0, 4, 4],
  ["CE102", "Surveying Basics", 3, 0, 2, 4],
  ["HS101", "Communicative English", 2, 0, 2, 3],
]);
addBatch("CIVIL", 2, "Core", [
  ["MA201", "Engineering Mathematics II", 3, 1, 0, 4],
  ["CE201", "Building Materials", 3, 0, 0, 3],
  ["CE202", "Surveying", 3, 0, 2, 4],
  ["CE203", "Engineering Mechanics", 3, 0, 0, 3],
  ["CE204", "Strength of Materials", 3, 0, 2, 4],
  ["CE205", "Construction Practices", 3, 0, 0, 3],
]);
addBatch("CIVIL", 3, "Core", [
  ["CE301", "Structural Analysis I", 3, 1, 0, 4],
  ["CE302", "Concrete Technology", 3, 0, 2, 4],
  ["CE303", "Fluid Mechanics", 3, 0, 2, 4],
  ["CE304", "Geotechnical Engineering I", 3, 0, 0, 3],
]);
addBatch("CIVIL", 3, "Elective", [
  ["CE351", "Sustainable Construction", 3, 0, 0, 3],
  ["CE352", "Remote Sensing", 3, 0, 0, 3],
]);
addBatch("CIVIL", 4, "Core", [
  ["CE401", "Structural Analysis II", 3, 1, 0, 4],
  ["CE402", "Geotechnical Engineering II", 3, 0, 0, 3],
  ["CE403", "Water Resources Engineering", 3, 0, 2, 4],
  ["CE404", "Transportation Engineering I", 3, 0, 0, 3],
]);
addBatch("CIVIL", 4, "Elective", [
  ["CE451", "Earthquake Engineering", 3, 0, 0, 3],
  ["CE452", "Urban Planning", 3, 0, 0, 3],
]);
addBatch("CIVIL", 5, "Core", [
  ["CE501", "Environmental Engineering I", 3, 0, 2, 4],
  ["CE502", "Design of RC Structures", 3, 0, 0, 3],
  ["CE503", "Transportation Engineering II", 3, 0, 0, 3],
  ["CE504", "Hydrology", 3, 0, 0, 3],
]);
addBatch("CIVIL", 5, "Elective", [
  ["CE551", "Green Buildings", 3, 0, 0, 3],
  ["CE552", "Construction Management", 3, 0, 0, 3],
]);
addBatch("CIVIL", 6, "Core", [
  ["CE601", "Environmental Engineering II", 3, 0, 2, 4],
  ["CE602", "Steel Structures", 3, 0, 0, 3],
  ["CE603", "Foundation Engineering", 3, 0, 0, 3],
  ["CE604", "Structural Dynamics", 3, 0, 0, 3],
]);
addBatch("CIVIL", 6, "Elective", [
  ["CE651", "Bridge Engineering", 3, 0, 0, 3],
  ["CE652", "Disaster Management", 3, 0, 0, 3],
]);
addBatch("CIVIL", 7, "Core", [
  ["CE701", "Design of Prestressed Concrete", 3, 0, 0, 3],
  ["CE702", "Construction Planning & Scheduling", 3, 0, 0, 3],
  ["CE703", "Project Work Phase I", 0, 0, 6, 3],
  ["CE704", "Advanced Surveying", 3, 0, 0, 3],
]);
addBatch("CIVIL", 7, "Elective", [
  ["CE751", "Infrastructure Finance", 3, 0, 0, 3],
  ["CE752", "Urban Mobility", 3, 0, 0, 3],
]);
addBatch("CIVIL", 8, "Core", [
  ["CE801", "Project Work Phase II", 0, 0, 12, 6],
  ["CE802", "Professional Ethics", 2, 0, 0, 2],
  ["CE803", "Entrepreneurship Development", 2, 0, 0, 2],
]);
addBatch("CIVIL", 8, "Elective", [
  ["CE851", "Smart Cities", 3, 0, 0, 3],
  ["CE852", "Sustainable Infrastructure", 3, 0, 0, 3],
]);

const initializeCourseTable = async () => {
  await db.query(`
    CREATE TABLE IF NOT EXISTS courses (
      id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      course_id VARCHAR(20) NOT NULL,
      course_name VARCHAR(255) NOT NULL,
      department VARCHAR(20) NOT NULL,
      semester TINYINT NOT NULL,
      course_type ENUM('Core', 'Elective') NOT NULL,
      L INT NOT NULL DEFAULT 0,
      T INT NOT NULL DEFAULT 0,
      P INT NOT NULL DEFAULT 0,
      C INT NOT NULL DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_courses_dept_sem (department, semester),
      INDEX idx_courses_type (course_type)
    )
  `);
};

const seedCoursesIfEmpty = async () => {
  const [rows] = await db.query("SELECT COUNT(*) AS count FROM courses");
  const count = rows[0]?.count || 0;
  if (count > 0) return;

  const values = COURSE_SEED.map((course) => [
    course.course_id,
    course.course_name,
    course.department,
    course.semester,
    course.course_type,
    course.L,
    course.T,
    course.P,
    course.C,
  ]);

  const chunkSize = 250;
  for (let i = 0; i < values.length; i += chunkSize) {
    const chunk = values.slice(i, i + chunkSize);
    await db.query(
      "INSERT INTO courses (course_id, course_name, department, semester, course_type, L, T, P, C) VALUES ?",
      [chunk]
    );
  }
};

const getCoursesByDepartmentSemester = async (department, semester) => {
  const masterCourses = await getMasterCoursesByDepartmentSemester(department, semester);

  const [rows] = await db.query(
    `
      SELECT course_id, course_name, department, semester, course_type, L, T, P, C
      FROM courses
      WHERE UPPER(department) = ? AND semester = ?
      ORDER BY course_type DESC, course_id ASC
    `,
    [String(department || "").toUpperCase(), Number(semester)]
  );

  const seedCourses = rows.map((row) => ({
    courseId: row.course_id,
    courseName: row.course_name,
    department: row.department,
    semester: Number(row.semester),
    courseType: row.course_type,
    L: Number(row.L),
    T: Number(row.T),
    P: Number(row.P),
    C: Number(row.C),
  }));

  if (!masterCourses.length) {
    return seedCourses;
  }

  const merged = new Map();
  masterCourses.forEach((course) => {
    merged.set(String(course.courseId || "").toUpperCase(), course);
  });
  seedCourses.forEach((course) => {
    const key = String(course.courseId || "").toUpperCase();
    if (!merged.has(key)) merged.set(key, course);
  });

  return Array.from(merged.values());
};

module.exports = {
  initializeCourseTable,
  seedCoursesIfEmpty,
  getCoursesByDepartmentSemester,
};
