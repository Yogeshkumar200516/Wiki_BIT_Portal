// src/pages/Admin/ComplaintReview/ComplaintReview.jsx

import React, { useState } from "react";
import "./ComplaintReview.css";
import { useComplaints } from "../../../context/ComplaintContext";
import { useFacultyscore } from "../../../context/FacultyscoreContext";

const catStyle = {
  Academic:  { background: "#ede5ff", color: "#5c35d9" },
  Faculty:   { background: "#fce7f3", color: "#9d174d" },
  Technical: { background: "#dbeafe", color: "#1d4ed8" },
  Other:     { background: "#f3f4f6", color: "#374151" },
};

const PhotoViewer = ({ src, onClose }) => (
  <div className="cr-overlay" onClick={onClose}>
    <div className="cr-photo-box" onClick={(e) => e.stopPropagation()}>
      <button className="cr-photo-close" onClick={onClose}>✕</button>
      <img src={src} alt="proof" />
    </div>
  </div>
);

// ── Review Modal ──────────────────────────────────────────────────────────────
const ReviewModal = ({ complaint, faculties, onClose, onSubmit }) => {
  const [reason,    setReason]    = useState(complaint.adminResponse || "");
  const [decision,  setDecision]  = useState(
    complaint.status === "Approved" || complaint.status === "Rejected"
      ? complaint.status : null
  );
  const [targetFac, setTargetFac] = useState(complaint.targetFacultyId || "");
  const [saving,    setSaving]    = useState(false);
  const [viewPhoto, setViewPhoto] = useState(false);
  const [reasonErr, setReasonErr] = useState("");
  const isFinal = complaint.status === "Approved" || complaint.status === "Rejected";

  const isFacultyComplaint = complaint.category === "Faculty";

  const handleSave = async () => {
    if (isFinal) return;
    if (!decision) return;
    if (!reason.trim()) {
      setReasonErr("Please provide a reason for your decision.");
      return;
    }
    if (decision === "Approved" && isFacultyComplaint && !targetFac) {
      setReasonErr("Please select which faculty this complaint is about.");
      return;
    }
    setSaving(true);
    try {
      await onSubmit(complaint.id, decision, reason, targetFac || null);
      onClose();
    } catch (err) {
      setReasonErr(err.message || "Failed to save review.");
    } finally {
      setSaving(false);
    }
  };

  const selectedFaculty = faculties.find((f) => f.id === targetFac);

  return (
    <div className="cr-modal-overlay" onClick={onClose}>
      <div className="cr-modal" onClick={(e) => e.stopPropagation()}>

        <div className="cr-modal-header">
          <h3>Review Complaint</h3>
          <button className="cr-modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="cr-modal-body">
          <div className="cr-info-grid">
            <div className="cr-info-item">
              <span className="cr-info-label">Student</span>
              <span className="cr-info-value">{complaint.studentName} · {complaint.studentId}</span>
            </div>
            <div className="cr-info-item">
              <span className="cr-info-label">Category</span>
              <span className="cr-badge" style={catStyle[complaint.category]}>
                {complaint.category}
              </span>
            </div>
            <div className="cr-info-item cr-full">
              <span className="cr-info-label">Title</span>
              <span className="cr-info-value">{complaint.title}</span>
            </div>
            <div className="cr-info-item cr-full">
              <span className="cr-info-label">Description</span>
              <div className="cr-desc">{complaint.description}</div>
            </div>
            {complaint.photoProof && (
              <div className="cr-info-item cr-full">
                <span className="cr-info-label">Photo Proof</span>
                <button className="cr-proof-preview" onClick={() => setViewPhoto(true)}>
                  <img src={complaint.photoProof} alt="proof" />
                  <span>Click to view full image</span>
                </button>
              </div>
            )}
          </div>

          {isFacultyComplaint && (
            <div className="cr-faculty-select-section">
              <span className="cr-select-label">
                Faculty Concerned
                {decision === "Approved" && <span className="cr-req"> *</span>}
              </span>
              <select
                className="cr-faculty-select"
                value={targetFac}
                onChange={(e) => { setTargetFac(e.target.value); setReasonErr(""); }}
              
                disabled={isFinal}
>
                <option value="">— Select faculty —</option>
                {faculties.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.department}) — Score: {f.score}
                  </option>
                ))}
              </select>
              {decision === "Approved" && selectedFaculty && (
                <div className="cr-score-warning">
                  ⚠ Approving will deduct 1 point from <strong>{selectedFaculty.name}</strong>'s
                  score ({selectedFaculty.score} → {selectedFaculty.score - 1}).
                  They will be notified automatically.
                </div>
              )}
            </div>
          )}

          <div className="cr-decision-section">
            <span className="cr-decision-label">
              Decision <span className="cr-req">*</span>
            </span>
            <div className="cr-decision-row">
              <button
                type="button"
                className={`cr-decide-btn approve${decision === "Approved" ? " selected" : ""}`}
                onClick={() => { setDecision("Approved"); setReasonErr(""); }}
              
                disabled={isFinal}
>
                <span className="cr-decide-icon">✓</span>
                Approve
              </button>
              <button
                type="button"
                className={`cr-decide-btn reject${decision === "Rejected" ? " selected" : ""}`}
                onClick={() => { setDecision("Rejected"); setReasonErr(""); }}
              
                disabled={isFinal}
>
                <span className="cr-decide-icon">✕</span>
                Reject
              </button>
            </div>
          </div>

          <div className="cr-resp-field">
            <label>
              {decision === "Rejected" ? "Reason for Rejection" : "Reason / Remarks"}
              <span className="cr-req"> *</span>
            </label>
            <textarea
              rows={4}
              value={reason}
              onChange={(e) => { setReason(e.target.value); setReasonErr(""); }}
              placeholder={
                decision === "Rejected"
                  ? "Explain why this complaint is being rejected..."
                  : "Explain why this complaint is approved and what action is taken..."
              }
              disabled={isFinal}
            />
            {reasonErr && <span className="cr-errtxt">{reasonErr}</span>}
          </div>
        </div>

        <div className="cr-modal-footer">
          <button className="cr-btn-cancel" onClick={onClose}>Cancel</button>
          <button
            className={`cr-btn-save${decision === "Rejected" ? " reject-mode" : ""}`}
            onClick={handleSave}
            disabled={isFinal || !decision || !reason.trim() || saving}
          >
            {saving
              ? "Saving..."
              : decision === "Approved" ? "✓ Confirm Approve"
              : decision === "Rejected" ? "✕ Confirm Reject"
              : "Select a Decision"}
          </button>
        </div>

        {viewPhoto && (
          <PhotoViewer src={complaint.photoProof} onClose={() => setViewPhoto(false)} />
        )}
      </div>
    </div>
  );
};

// ── Main ──────────────────────────────────────────────────────────────────────
const ComplaintReview = () => {
  const { complaints, reviewComplaint, loading, error } = useComplaints();
  const { faculties, refreshFaculties, loadingFaculties } = useFacultyscore();

  const [selected,  setSelected]  = useState(null);
  const [filter,    setFilter]    = useState("All");
  const [viewPhoto, setViewPhoto] = useState(null);
  const [toast,     setToast]     = useState(null);

  const filtered = complaints.filter((c) =>
    filter === "All" ? true : c.status === filter
  );

  const pending  = complaints.filter((c) => c.status === "Pending").length;
  const approved = complaints.filter((c) => c.status === "Approved").length;
  const rejected = complaints.filter((c) => c.status === "Rejected").length;

  const handleReview = async (id, decision, reason, targetFacultyId) => {
    await reviewComplaint(id, decision, reason, targetFacultyId);
    await refreshFaculties();
    setSelected(null);
    setToast({
      message: decision === "Approved"
        ? "Complaint approved. Faculty score updated and notified."
        : "Complaint rejected. Student can view your response.",
      type: decision === "Approved" ? "approve" : "reject",
    });
    setTimeout(() => setToast(null), 3500);
  };

  const getStatusClass = (status) => {
    if (status === "Approved") return "approved";
    if (status === "Rejected") return "rejected";
    return "pending";
  };

  return (
    <div className="cr-page">

      <div className="cr-heading">
        <p className="cr-eyebrow">Admin Panel · Review</p>
        <h1>Complaint Review</h1>
        <p>Manage and respond to complaints submitted by students.</p>
      </div>

      <div className="cr-stats">
        <div className="cr-stat">
          <span className="cr-stat-num">{complaints.length}</span>
          <span className="cr-stat-label">Total</span>
        </div>
        <div className="cr-stat">
          <span className="cr-stat-num" style={{ color: "#d97706" }}>{pending}</span>
          <span className="cr-stat-label">Pending</span>
        </div>
        <div className="cr-stat">
          <span className="cr-stat-num" style={{ color: "#059669" }}>{approved}</span>
          <span className="cr-stat-label">Approved</span>
        </div>
        <div className="cr-stat">
          <span className="cr-stat-num" style={{ color: "#dc2626" }}>{rejected}</span>
          <span className="cr-stat-label">Rejected</span>
        </div>
      </div>

      <div className="cr-card">
        <div className="cr-card-top">
          <h2>Student Complaints</h2>
          <div className="cr-filters">
            {["All", "Pending", "Approved", "Rejected"].map((f) => (
              <button
                key={f}
                className={`cr-filter${filter === f ? " active" : ""}`}
                onClick={() => setFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {loading || loadingFaculties ? (
          <div className="cr-empty"><p>Loading complaints...</p></div>
        ) : error ? (
          <div className="cr-empty"><p>{error}</p></div>
        ) : complaints.length === 0 ? (
          <div className="cr-empty">
            <p>No complaints submitted yet.</p>
            <span>Complaints submitted by students will appear here.</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="cr-empty"><p>No {filter.toLowerCase()} complaints.</p></div>
        ) : (
          <div className="cr-table-wrap">
            <table className="cr-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Student</th>
                  <th>Title</th>
                  <th>Faculty</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Photo</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Reason</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, i) => (
                  <tr key={c.id}>
                    <td className="cr-td-num">{i + 1}</td>
                    <td className="cr-td-student">
                      <div className="cr-avatar">{c.studentName.charAt(0)}</div>
                      <div>
                        <div className="cr-student-name">{c.studentName}</div>
                        <div className="cr-student-id">{c.studentId}</div>
                      </div>
                    </td>
                    <td className="cr-td-title">{c.title}</td>
                    <td>{c.facultyName || "—"}</td>
                    <td>
                      <span className="cr-badge" style={catStyle[c.category]}>
                        {c.category}
                      </span>
                    </td>
                    <td className="cr-td-desc">
                      <span className="cr-clamp">{c.description}</span>
                    </td>
                    <td>
                      {c.photoProof ? (
                        <button className="cr-thumb-btn" onClick={() => setViewPhoto(c.photoProof)}>
                          <img src={c.photoProof} alt="proof" />
                        </button>
                      ) : (
                        <span className="cr-none">—</span>
                      )}
                    </td>
                    <td className="cr-td-date">{c.date}</td>
                    <td>
                      <span className={`cr-status ${getStatusClass(c.status)}`}>
                        {c.status === "Approved" && "✓ "}
                        {c.status === "Rejected" && "✕ "}
                        {c.status}
                      </span>
                    </td>
                    <td className="cr-td-reason">
                      {c.adminResponse
                        ? <span className="cr-reason-text">{c.adminResponse}</span>
                        : <span className="cr-none">—</span>
                      }
                    </td>
                    <td>
                      <button
                        className={`cr-action${c.status !== "Pending" ? " done" : ""}`}
                        disabled={c.status !== "Pending"}
                    onClick={() => c.status === "Pending" && setSelected(c)}
                      >
                        {c.status === "Approved" ? "✓ Approved"
                          : c.status === "Rejected" ? "✕ Rejected"
                          : "Review"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && (
        <ReviewModal
          complaint={selected}
          faculties={faculties}
          onClose={() => setSelected(null)}
          onSubmit={handleReview}
        />
      )}

      {viewPhoto && (
        <PhotoViewer src={viewPhoto} onClose={() => setViewPhoto(null)} />
      )}

      {toast && (
        <div className={`cr-toast ${toast.type}`}>{toast.message}</div>
      )}
    </div>
  );
};

export default ComplaintReview;

