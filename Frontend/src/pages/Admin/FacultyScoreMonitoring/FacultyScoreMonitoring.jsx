import React, { useEffect } from "react";
import "./FacultyScoreMonitoring.css";
import { useFacultyscore } from "../../../context/FacultyscoreContext";

function FacultyScoreMonitoring() {
  const { faculties, loadingFaculties, refreshFaculties } = useFacultyscore();

  useEffect(() => {
    refreshFaculties();
  }, []);

  const getScoreClass = (score) => {
    if (score >= 80) return "high";
    if (score >= 50) return "medium";
    return "low";
  };

  return (
    <div className="fs-page">
      <div className="fs-heading">
        <h1>Faculty Score Monitoring</h1>
        <p>Track and monitor faculty performance scores based on complaint reviews.</p>
      </div>

      <div className="fs-card">
        <div className="fs-card-top">
          <h2>Faculty Scores</h2>
        </div>

        {loadingFaculties ? (
          <div className="fs-empty"><p>Loading scores...</p></div>
        ) : faculties.length === 0 ? (
          <div className="fs-empty"><p>No faculty score records found.</p></div>
        ) : (
          <div className="fs-table-wrap">
            <table className="fs-table">
              <thead>
                <tr>
                  <th>Faculty ID</th>
                  <th>Name</th>
                  <th>Department</th>
                  <th>Score</th>
                </tr>
              </thead>
              <tbody>
                {faculties.map((faculty) => (
                  <tr key={faculty.id}>
                    <td className="fs-td-id">{faculty.id}</td>
                    <td>
                      <div className="fs-td-name">
                        <div className="fs-avatar">{faculty.name.charAt(0)}</div>
                        <span className="fs-name-text">{faculty.name}</span>
                      </div>
                    </td>
                    <td>
                      <span className="fs-dept">{faculty.department}</span>
                    </td>
                    <td>
                      <span className={`fs-score ${getScoreClass(faculty.score)}`}>
                        {faculty.score}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default FacultyScoreMonitoring;