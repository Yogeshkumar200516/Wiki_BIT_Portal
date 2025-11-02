import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Student.css";

function Student() {
    const [studentData, setStudentData] = useState(null);

    useEffect(() => {
        // Sample data; replace with an API call in real-world scenarios
        const mockData = {
            name: "YOGESH KUMAR S",
            academicYear: "2024-2025",
            departmentName: "B.E. Mechanical Engineering",
            departmentCode: "MECH",
            currentSemester: 4,
            minimumCreditsToEarn: 25,
            courses: [
                // Core Courses
                {
                    type: "core",
                    code: "22ME401",
                    name: "KINEMATICS AND DYNAMICS OF MACHINERY",
                    PEOs: "II",
                    POs: "a,b",
                    L: 2,
                    T: 1,
                    P: 2,
                    C: 4,
                },
                {
                    type: "core",
                    code: "22ME402",
                    name: "SENSORS AND TRANSDUCERS",
                    PEOs: "I,II,III",
                    POs: "a,b,c,d,e,k,l,m,n",
                    L: 3,
                    T: 0,
                    P: 2,
                    C: 4,
                },
                {
                    type: "core",
                    code: "22ME403",
                    name: "STRENGTH OF MATERIALS",
                    PEOs: "I,II,III",
                    POs: "a,b,c,d,e,g,i,k,l,m,n",
                    L: 2,
                    T: 1,
                    P: 2,
                    C: 4,
                },
                {
                    type: "core",
                    code: "22ME404",
                    name: "INDUSTRIAL AUTOMATION WITH PLC",
                    PEOs: "I,II,III",
                    POs: "a,b,c,d,e,k,l,m",
                    L: 2,
                    T: 0,
                    P: 2,
                    C: 3,
                },
                {
                    type: "core",
                    code: "22ME405",
                    name: "MATERIALS AND MANUFACTURING PROCESSES",
                    PEOs: "I,II,III",
                    POs: "a,b,c,d,e,k,l,m",
                    L: 2,
                    T: 0,
                    P: 2,
                    C: 3,
                },
                {
                    type: "core",
                    code: "22ME406",
                    name: "MECHANICAL VIBRATIONS",
                    PEOs: "II",
                    POs: "a,b,c",
                    L: 2,
                    T: 1,
                    P: 1,
                    C: 4,
                },
                // Elective Courses
                {
                    type: "elective",
                    code: "22ME001",
                    name: "CONCEPTS OF ENGINEERING DESIGN",
                    PEOs: "I,II,III",
                    POs: "a,b,c,d",
                    L: 3,
                    T: 0,
                    P: 2,
                    C: 3,
                },
                {
                    type: "elective",
                    code: "22ME002",
                    name: "NON-TRADITIONAL MACHINING PROCESSES",
                    PEOs: "II",
                    POs: "a,b,c",
                    L: 2,
                    T: 1,
                    P: 1,
                    C: 3,
                },
                {
                    type: "elective",
                    code: "22ME003",
                    name: "ROBOTICS AND AUTOMATION",
                    PEOs: "I,III",
                    POs: "a,b,c,d,e",
                    L: 2,
                    T: 0,
                    P: 2,
                    C: 3,
                },
            ],
        };

        setStudentData(mockData);
    }, []);

    if (!studentData) {
        return <div className="loading">Loading...</div>;
    }

    const coreCourses = studentData.courses.filter((course) => course.type === "core");
    const electiveCourses = studentData.courses.filter((course) => course.type === "elective");

    const calculateTotals = (courses) => {
        return courses.reduce(
            (totals, course) => ({
                L: totals.L + course.L,
                T: totals.T + course.T,
                P: totals.P + course.P,
                C: totals.C + course.C,
            }),
            { L: 0, T: 0, P: 0, C: 0 }
        );
    };

    const coreTotals = calculateTotals(coreCourses);
    const electiveTotals = calculateTotals(electiveCourses);
    const allTotals = calculateTotals(studentData.courses);

    return (
        <div className="dashboard-container">
            {/* Header */}
            <div className="student-info">
                <h2>Welcome, {studentData.name}!</h2>
                <p>
                    <strong>📚 Department of {studentData.departmentName}</strong>  ({studentData.departmentCode})
                </p>
                <p>
                    <strong>📅 {studentData.academicYear} (Semester: {studentData.currentSemester})</strong> 
                </p>
            </div>

            {/* Courses Section */}
            <div className="course-tables">
                <div className="minimum-credits">
                    <h3>Minimum Credits to Earn: {studentData.minimumCreditsToEarn}</h3>
                </div>

                {/* Core Courses */}
                <div className="course-section">
                    <h3>Core Courses</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Code</th>
                                <th>Course</th>
                                <th>PEOs</th>
                                <th>POs</th>
                                <th>L</th>
                                <th>T</th>
                                <th>P</th>
                                <th>C</th>
                            </tr>
                        </thead>
                        <tbody>
                            {coreCourses.map((course, index) => (
                                <tr key={index}>
                                    <td>{course.code}</td>
                                    <td><Link to={`/materials/${course.code}`}>{course.name}</Link></td>
                                    <td>{course.PEOs}</td>
                                    <td>{course.POs}</td>
                                    <td>{course.L}</td>
                                    <td>{course.T}</td>
                                    <td>{course.P}</td>
                                    <td>{course.C}</td>
                                </tr>
                            ))}
                            <tr className="totals-row">
                                <td colSpan="4"><strong>Total</strong></td>
                                <td>{coreTotals.L}</td>
                                <td>{coreTotals.T}</td>
                                <td>{coreTotals.P}</td>
                                <td>{coreTotals.C}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Elective Courses */}
                <div className="course-section">
                    <h3>Elective Courses</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>Code</th>
                                <th>Course</th>
                                <th>PEOs</th>
                                <th>POs</th>
                                <th>L</th>
                                <th>T</th>
                                <th>P</th>
                                <th>C</th>
                            </tr>
                        </thead>
                        <tbody>
                            {electiveCourses.map((course, index) => (
                                <tr key={index}>
                                    <td>{course.code}</td>
                                    <td>{course.name}</td>
                                    <td>{course.PEOs}</td>
                                    <td>{course.POs}</td>
                                    <td>{course.L}</td>
                                    <td>{course.T}</td>
                                    <td>{course.P}</td>
                                    <td>{course.C}</td>
                                </tr>
                            ))}
                            <tr className="totals-row">
                                <td colSpan="4"><strong>Total</strong></td>
                                <td>{electiveTotals.L}</td>
                                <td>{electiveTotals.T}</td>
                                <td>{electiveTotals.P}</td>
                                <td>{electiveTotals.C}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default Student;
