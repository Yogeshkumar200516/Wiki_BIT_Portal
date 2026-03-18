import React, { useEffect, useMemo, useState } from "react";
import "./Status.css";
import { useAuth } from "../../../context/AuthContext";
import { apiUrl } from "../../../utils/api";

function Status() {
  const { user } = useAuth();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [readOnly, setReadOnly] = useState(false);

  useEffect(() => {
    const loadMaterials = async () => {
      if (!user?.user_id) return;
      setMaterials([]);
      setLoading(true);
      setError("");
      setReadOnly(false);
      try {
        const response = await fetch(apiUrl(`/faculty/materials/${user.user_id}`));
        if (response.ok) {
          const data = await response.json();
          setMaterials(data.success ? data.data || [] : []);
          return;
        }
        throw new Error("Faculty materials endpoint unavailable");
      } catch (err) {
        try {
          const fallbackResponse = await fetch(apiUrl("/student/materials"));
          const fallbackData = await fallbackResponse.json();
          setMaterials(
            fallbackResponse.ok && fallbackData.success ? fallbackData.data || [] : []
          );
          setReadOnly(true);
        } catch (fallbackErr) {
          setError("Unable to load activity status data.");
        }
      } finally {
        setLoading(false);
      }
    };

    loadMaterials();
  }, [user?.user_id]);

  const rows = useMemo(() => {
    const hasIdentityFields = materials.some(
      (material) =>
        material.facultyId ||
        material.faculty_id ||
        material.faculty ||
        material.faculty_name
    );

    const filtered = hasIdentityFields
      ? materials.filter((material) => {
          const facultyId =
            material.facultyId || material.faculty_id || "";
          const facultyName =
            material.faculty || material.faculty_name || "";
          if (facultyId) {
            return String(facultyId) === String(user?.user_id || "");
          }
          if (facultyName && user?.name) {
            return (
              String(facultyName).toLowerCase() ===
              String(user.name).toLowerCase()
            );
          }
          return false;
        })
      : materials;

    return filtered.map((material) => ({
      id: material.id,
      course: material.course || material.course_name || "-",
      lesson: material.lessonPlanTitle || material.title || material.unit_name || "Unit",
      lessonNumber: material.lessonPlanNumber || material.unit_number || "",
      date: material.uploadedAt || material.date || material.upload_date || "-",
      status: material.status || material.approval_status || "Approved",
      feedback: material.adminFeedback || material.admin_feedback || material.adminResponse || "-",
    }));
  }, [materials, user?.user_id, user?.name]);

  // ── Derived counts for stat cards ──────────────────────
  const counts = useMemo(() => ({
    total:    rows.length,
    approved: rows.filter((r) => r.status.toLowerCase() === "approved").length,
    pending:  rows.filter((r) => r.status.toLowerCase() === "pending").length,
    rejected: rows.filter((r) => r.status.toLowerCase() === "rejected").length,
  }), [rows]);

  const formatDate = (raw) => {
    if (!raw || raw === "-") return "-";
    const d = new Date(raw);
    if (isNaN(d)) return raw;
    return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  };

  return (
    <div className="fs-page">

      {/* ── Header ────────────────────────────────────── */}
      <div className="fs-header">
        <div className="fs-header-left">
          <p className="fs-header-eyebrow">Faculty Portal</p>
          <h1>Activity Status</h1>
          <p>Track the approval status of your uploaded materials.</p>
        </div>
        {readOnly && (
          <span className="fs-hint">Showing approved materials only.</span>
        )}
      </div>

      {/* ── Error banner ──────────────────────────────── */}
      {error && <div className="fs-banner">{error}</div>}

      {/* ── Stat cards ────────────────────────────────── */}
      {!loading && rows.length > 0 && (
        <div className="fs-stats">
          <div className="fs-stat-card total">
            <span className="fs-stat-icon"></span>
            <div className="fs-stat-value">{counts.total}</div>
            <div className="fs-stat-label">Total Uploaded</div>
          </div>
          <div className="fs-stat-card approved">
            <span className="fs-stat-icon"></span>
            <div className="fs-stat-value">{counts.approved}</div>
            <div className="fs-stat-label">Approved</div>
          </div>
          <div className="fs-stat-card pending">
            <span className="fs-stat-icon"></span>
            <div className="fs-stat-value">{counts.pending}</div>
            <div className="fs-stat-label">Pending</div>
          </div>
          <div className="fs-stat-card rejected">
            <span className="fs-stat-icon"></span>
            <div className="fs-stat-value">{counts.rejected}</div>
            <div className="fs-stat-label">Rejected</div>
          </div>
        </div>
      )}

      {/* ── Table ─────────────────────────────────────── */}
      <div className="fs-table-wrap">
        {loading ? (
          <div className="fs-loading">
            <div className="fs-loading-dot" />
            <div className="fs-loading-dot" />
            <div className="fs-loading-dot" />
          </div>
        ) : rows.length === 0 ? (
          <div className="fs-empty">No materials available yet.</div>
        ) : (
          <>
            <table className="fs-table">
              <thead>
                <tr>
                  <th>Course Name</th>
                  <th>Lesson Name</th>
                  <th>LP&nbsp;#</th>
                  <th>Upload Date</th>
                  <th>Status</th>
                  <th>Admin Feedback</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id}>
                    <td>{row.course}</td>
                    <td>{row.lesson}</td>
                    <td>
                      {row.lessonNumber ? (
                        <span className="fs-lp-num">{row.lessonNumber}</span>
                      ) : (
                        <span style={{ color: "#cbd5e1" }}>—</span>
                      )}
                    </td>
                    <td>
                      <span className="fs-date">{formatDate(row.date)}</span>
                    </td>
                    <td>
                      <span className={`fs-badge ${row.status.toLowerCase()}`}>
                        {row.status}
                      </span>
                    </td>
                    <td>
                      <span className="fs-feedback">
                        {row.feedback && row.feedback !== "-" ? row.feedback : "—"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Footer */}
            <div className="fs-table-footer">
              Showing {rows.length} record{rows.length !== 1 ? "s" : ""}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Status;
