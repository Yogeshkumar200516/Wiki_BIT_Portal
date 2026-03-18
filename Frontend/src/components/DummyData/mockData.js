// ============================================================
// AcadFlow - Central Dummy Data
// Place this in: src/components/DummyData/mockData.js
// ============================================================

export const dummyMaterials = [
  {
    id: 1,
    course: "Data Structures",
    courseCode: "CS301",
    faculty: "Dr. Priya Nair",
    title: "Linked List - Complete Notes",
    file: "linked_list.pdf",
    date: "2026-03-01",
    type: "PDF",
    unit: "Unit 2",
    status: "Approved",
  },
  {
    id: 2,
    course: "Algorithms",
    courseCode: "CS302",
    faculty: "Prof. Arjun Mehta",
    title: "Sorting Algorithms - Lecture Slides",
    file: "sorting.pdf",
    date: "2026-03-03",
    type: "PDF",
    unit: "Unit 1",
    status: "Approved",
  },
  {
    id: 3,
    course: "Database Systems",
    courseCode: "CS401",
    faculty: "Dr. Leena Thomas",
    title: "SQL Query Optimization",
    file: "sql_opt.pdf",
    date: "2026-03-05",
    type: "PDF",
    unit: "Unit 3",
    status: "Approved",
  },
  {
    id: 4,
    course: "Operating Systems",
    courseCode: "CS501",
    faculty: "Prof. Suresh Kumar",
    title: "Process Scheduling - Video Lecture",
    file: "process.mp4",
    date: "2026-03-06",
    type: "Video",
    unit: "Unit 4",
    status: "Approved",
  },
  {
    id: 5,
    course: "Computer Networks",
    courseCode: "CS601",
    faculty: "Dr. Kavitha R",
    title: "TCP/IP Reference Guide",
    file: "tcpip.pdf",
    date: "2026-03-07",
    type: "PDF",
    unit: "Unit 2",
    status: "Approved",
  },
  {
    id: 6,
    course: "Data Structures",
    courseCode: "CS301",
    faculty: "Dr. Priya Nair",
    title: "Binary Trees - Complete Notes",
    file: "btrees.pdf",
    date: "2026-03-08",
    type: "PDF",
    unit: "Unit 3",
    status: "Approved",
  },
];

export const dummyComplaints = [
  {
    id: 1,
    studentName: "Ravi Kumar",
    studentId: "CS21001",
    title: "Cannot access lecture PDFs",
    category: "Technical",
    description:
      "All PDFs uploaded by faculty are returning 404 errors since last week. Unable to download any material from the portal.",
    status: "Reviewed",
    adminResponse:
      "Issue identified — server migration caused broken links. All files have been re-uploaded. Please clear your browser cache and try again.",
    date: "2026-03-01",
  },
  {
    id: 2,
    studentName: "Meena Sharma",
    studentId: "CS21002",
    title: "Faculty not covering syllabus",
    category: "Academic",
    description:
      "Prof. Arjun Mehta has not covered Unit 3 topics even though exams are in 2 weeks. We are falling significantly behind schedule.",
    status: "Pending",
    adminResponse: "",
    date: "2026-03-05",
  },
  {
    id: 3,
    studentName: "Arun Patel",
    studentId: "CS21003",
    title: "Unresponsive faculty emails",
    category: "Faculty",
    description:
      "Sent 4 emails to Dr. Leena Thomas over 3 weeks with absolutely no reply. Need clarification on project guidelines urgently.",
    status: "Pending",
    adminResponse: "",
    date: "2026-03-07",
  },
  {
    id: 4,
    studentName: "Divya Menon",
    studentId: "CS21004",
    title: "Lab system login broken",
    category: "Technical",
    description:
      "Lab portal credentials stopped working after the recent password reset. IT helpdesk has not responded to 2 tickets.",
    status: "Reviewed",
    adminResponse:
      "Password reset portal was down for scheduled maintenance. It has now been restored. Please use the 'Forgot Password' option to reset your credentials.",
    date: "2026-03-08",
  },
  {
    id: 5,
    studentName: "Karthik Raja",
    studentId: "CS21005",
    title: "Marks not updated on portal",
    category: "Academic",
    description:
      "My mid-semester exam marks were submitted 3 weeks ago but are still showing as 'Not Updated' on the student portal.",
    status: "Pending",
    adminResponse: "",
    date: "2026-03-10",
  },
];

export const dummyFaculties = [
  {
    id: 1,
    name: "Dr. Priya Nair",
    department: "Computer Science",
    courses: ["Data Structures", "Advanced Algorithms"],
  },
  {
    id: 2,
    name: "Prof. Arjun Mehta",
    department: "Computer Science",
    courses: ["Algorithms", "Theory of Computation"],
  },
  {
    id: 3,
    name: "Dr. Leena Thomas",
    department: "Information Technology",
    courses: ["Database Systems", "Data Warehousing"],
  },
  {
    id: 4,
    name: "Prof. Suresh Kumar",
    department: "Computer Science",
    courses: ["Operating Systems", "System Programming"],
  },
  {
    id: 5,
    name: "Dr. Kavitha R",
    department: "Electronics",
    courses: ["Computer Networks", "IoT"],
  },
];

export const dummyRatings = [
  {
    id: 1,
    faculty: "Dr. Priya Nair",
    facultyId: 1,
    rating: 5,
    feedback: "Exceptional teaching! Makes complex topics very simple.",
    student: "Ravi Kumar",
    date: "2026-03-01",
  },
  {
    id: 2,
    faculty: "Dr. Priya Nair",
    facultyId: 1,
    rating: 4,
    feedback: "Very helpful and always available for doubt clearing sessions.",
    student: "Meena Sharma",
    date: "2026-03-03",
  },
  {
    id: 3,
    faculty: "Prof. Arjun Mehta",
    facultyId: 2,
    rating: 3,
    feedback: "Good knowledge but lectures are a bit fast-paced.",
    student: "Arun Patel",
    date: "2026-03-04",
  },
  {
    id: 4,
    faculty: "Dr. Leena Thomas",
    facultyId: 3,
    rating: 5,
    feedback: "Best database faculty. Real-world examples are excellent.",
    student: "Divya Menon",
    date: "2026-03-05",
  },
  {
    id: 5,
    faculty: "Prof. Suresh Kumar",
    facultyId: 4,
    rating: 4,
    feedback: "Clear explanations and good lab sessions.",
    student: "Ravi Kumar",
    date: "2026-03-06",
  },
  {
    id: 6,
    faculty: "Dr. Kavitha R",
    facultyId: 5,
    rating: 2,
    feedback: "Could improve interaction with students.",
    student: "Arun Patel",
    date: "2026-03-07",
  },
];

export const computeFacultyScores = (ratings) => {
  const map = {};
  ratings.forEach((r) => {
    if (!map[r.facultyId]) {
      map[r.facultyId] = { faculty: r.faculty, facultyId: r.facultyId, total: 0, count: 0 };
    }
    map[r.facultyId].total += r.rating;
    map[r.facultyId].count += 1;
  });
  return Object.values(map)
    .map((f) => ({ ...f, average: (f.total / f.count).toFixed(1) }))
    .sort((a, b) => b.average - a.average);
};