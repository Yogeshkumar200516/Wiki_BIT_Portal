import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "./CourseMaterials.css";
import { apiUrl } from "../../../utils/api";

const CourseMaterials = () => {
  const { courseId } = useParams();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const fileBase = apiUrl("").replace(/\/api\/?$/, "");

  useEffect(() => {
    if (!courseId) return;

    const loadMaterials = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(apiUrl(`/materials/${courseId}`));
        const data = await response.json();
        if (!response.ok || !data.success) {
          throw new Error(data.message || "Failed to load materials");
        }
        setMaterials(data.data || []);
      } catch (err) {
        setError(err.message || "Failed to load materials");
      } finally {
        setLoading(false);
      }
    };

    loadMaterials();
  }, [courseId]);

  const resolveFileUrl = (url) => {
    if (!url) return "";
    if (/^https?:\/\//i.test(url)) return url;
    if (url.startsWith("/")) return `${fileBase}${url}`;
    return `${fileBase}/uploads/${url}`;
  };

  const handleView = (url) => {
    const resolved = resolveFileUrl(url);
    if (!resolved) return;
    window.open(resolved, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="cm-page">
      <div className="cm-header">
        <div>
          <h1 className="cm-title">Course Materials</h1>
          <p className="cm-sub">Course: {courseId}</p>
        </div>
      </div>

      {loading ? (
        <div className="cm-card">
          <p className="cm-empty">Loading materials...</p>
        </div>
      ) : error ? (
        <div className="cm-card">
          <p className="cm-empty">{error}</p>
        </div>
      ) : materials.length === 0 ? (
        <div className="cm-card">
          <p className="cm-empty">No approved materials found.</p>
        </div>
      ) : (
        <div className="cm-card">
          <table className="cm-table">
            <thead>
              <tr>
                <th>LP Number</th>
                <th>Lesson Plan Title</th>
                <th>Lecture Material</th>
                <th>Lecture Video</th>
                <th>Discourse Link</th>
              </tr>
            </thead>
            <tbody>
              {materials.map((m, idx) => (
                <tr key={`${m.lessonNumber}-${idx}`}>
                  <td>
                    <span className="cm-pill">{m.lessonNumber}</span>
                  </td>
                  <td className="cm-title-cell">{m.lessonTitle}</td>
                  <td>
                    <button
                      className="cm-link"
                      onClick={() => handleView(m.pdfUrl)}
                      disabled={!m.pdfUrl}
                    >
                      View PDF
                    </button>
                  </td>
                  <td>
                    <button
                      className="cm-link"
                      onClick={() => handleView(m.videoUrl)}
                      disabled={!m.videoUrl}
                    >
                      View Video
                    </button>
                  </td>
                  <td>
                    <button
                      className="cm-link"
                      onClick={() => handleView(m.discourseUrl)}
                      disabled={!m.discourseUrl}
                    >
                      View Discourse
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CourseMaterials;
