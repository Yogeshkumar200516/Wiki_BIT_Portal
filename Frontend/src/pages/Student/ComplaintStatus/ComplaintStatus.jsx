import React, { useState, useRef, useEffect } from "react";
import "./ComplaintStatus.css";
import { useComplaints } from "../../../context/ComplaintContext";
import { apiUrl } from "../../../utils/api";

const CATEGORIES = ["Academic", "Faculty", "Technical", "Other"];

const catStyle = {
  Academic:  { background: "#ede5ff", color: "#5c35d9" },
  Faculty:   { background: "#fce7f3", color: "#9d174d" },
  Technical: { background: "#dbeafe", color: "#1d4ed8" },
  Other:     { background: "#f3f4f6", color: "#374151" },
};

const PhotoViewer = ({ src, onClose }) => (
  <div className="cs-overlay" onClick={onClose}>
    <div className="cs-photo-box" onClick={(e) => e.stopPropagation()}>
      <button className="cs-photo-close" onClick={onClose}>✕</button>
      <img src={src} alt="proof" />
    </div>
  </div>
);

const ComplaintStatus = () => {
  const { complaints, submitComplaint, loading, error } = useComplaints();

  const [form, setForm] = useState({ title: "", category: "", description: "", facultyId: "" });
  const [faculties, setFaculties] = useState([]);
  const [facultyLoading, setFacultyLoading] = useState(false);
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [viewPhoto, setViewPhoto] = useState(null);
  const [filter, setFilter] = useState("All");
  const fileRef = useRef();

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = "Please enter a title";
    if (!form.facultyId) e.facultyId = "Please select a faculty";
    if (!form.category) e.category = "Please select a category";
    if (!form.description.trim()) e.description = "Please describe your complaint";
    return e;
  };

  useEffect(() => {
    const loadFaculties = async () => {
      setFacultyLoading(true);
      try {
        const response = await fetch(apiUrl("/admin/faculties"));
        const data = await response.json();
        if (response.ok && data.success) {
          setFaculties(data.data || []);
        }
      } finally {
        setFacultyLoading(false);
      }
    };
    loadFaculties();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const processFile = (file) => {
    if (!file) return;
    if (!["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(file.type)) {
      setErrors((p) => ({ ...p, photo: "Only JPG, PNG or WEBP allowed" }));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setErrors((p) => ({ ...p, photo: "File must be under 5MB" }));
      return;
    }
    setPhoto(file);
    setErrors((p) => ({ ...p, photo: "" }));
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    setPhoto(null);
    setPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    try {
      await submitComplaint({
        title: form.title,
        facultyId: form.facultyId,
        facultyName: faculties.find((f) => f.user_id === form.facultyId)?.name || "",
        category: form.category,
        description: form.description,
        photoProof: photoPreview || null,
      });
      setForm({ title: "", category: "", description: "", facultyId: "" });
      removePhoto();
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 4000);
    } finally {
      setSaving(false);
    }
  };

  const filtered = complaints.filter((c) =>
    filter === "All" ? true : c.status === filter
  );

  const getStatusClass = (status) => {
    if (status === "Approved") return "approved";
    if (status === "Rejected") return "rejected";
    return "pending";
  };

  return (
    <div className="cs-page">

      <div className="cs-heading">
        <p className="cs-eyebrow">Student Portal · Complaints</p>
        <h1>Complaints</h1>
        <p>Submit a complaint and track its status below.</p>
      </div>

      <div className="cs-layout">

        {/* ── LEFT: NEW COMPLAINT FORM ── */}
        <div className="cs-card">
          <div className="cs-card-top">
            <h2>New Complaint</h2>
          </div>

          <div className="cs-card-body">
            {error && (
              <div className="cs-success" style={{ background: "#fee2e2", color: "#991b1b", borderColor: "#fecaca", borderLeftColor: "#dc2626" }}>
                {error}
              </div>
            )}
            {submitted && (
              <div className="cs-success">
                Complaint submitted. Admin will review and respond.
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>

              <div className="cs-field">
                <label>Title <span className="cs-req">*</span></label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  className={errors.title ? "cs-err" : ""}
                  placeholder="Short title for your complaint"
                />
                {errors.title && <span className="cs-errtxt">{errors.title}</span>}
              </div>

              <div className="cs-field">
                <label>Category <span className="cs-req">*</span></label>
                <div className="cs-cat-row">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      className={`cs-cat-btn${form.category === cat ? " active" : ""}`}
                      onClick={() => { setForm({ ...form, category: cat }); setErrors({ ...errors, category: "" }); }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                {errors.category && <span className="cs-errtxt">{errors.category}</span>}
              </div>

              <div className="cs-field">
                <label>Faculty Name <span className="cs-req">*</span></label>
                <select
                  name="facultyId"
                  value={form.facultyId}
                  onChange={handleChange}
                  className={errors.facultyId ? "cs-err" : ""}
                  disabled={facultyLoading}
                >
                  <option value="">Select Faculty</option>
                  {faculties.map((faculty) => (
                    <option key={faculty.user_id} value={faculty.user_id}>
                      {faculty.name}
                    </option>
                  ))}
                </select>
                {errors.facultyId && <span className="cs-errtxt">{errors.facultyId}</span>}
              </div>

              <div className="cs-field">
                <label>Description <span className="cs-req">*</span></label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  className={errors.description ? "cs-err" : ""}
                  placeholder="Explain your complaint in detail"
                  rows={5}
                />
                {errors.description && <span className="cs-errtxt">{errors.description}</span>}
              </div>

              <div className="cs-field">
                <label>
                  Photo Proof
                  <span className="cs-optional"> — optional, max 5MB</span>
                </label>

                {!photoPreview ? (
                  <div
                    className={`cs-upload${dragOver ? " drag" : ""}`}
                    onClick={() => fileRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => { e.preventDefault(); setDragOver(false); processFile(e.dataTransfer.files[0]); }}
                  >
                    <span className="cs-upload-icon">Upload</span>
                    <span>Click to upload or drag and drop</span>
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={(e) => processFile(e.target.files[0])}
                      style={{ display: "none" }}
                    />
                  </div>
                ) : (
                  <div className="cs-preview">
                    <img src={photoPreview} alt="preview" />
                    <div className="cs-preview-info">
                      <span>{photo?.name}</span>
                      <button type="button" onClick={removePhoto}>Remove</button>
                    </div>
                  </div>
                )}
                {errors.photo && <span className="cs-errtxt">{errors.photo}</span>}
              </div>

              <button type="submit" className="cs-submit" disabled={saving}>
                {saving ? "Submitting..." : "Submit Complaint"}
              </button>

            </form>
          </div>
        </div>

        {/* ── RIGHT: MY COMPLAINTS TABLE ── */}
        <div className="cs-card">
          <div className="cs-card-top">
            <h2>My Complaints</h2>
            <div className="cs-filters">
              {["All", "Pending", "Approved", "Rejected"].map((f) => (
                <button
                  key={f}
                  className={`cs-filter${filter === f ? " active" : ""}`}
                  onClick={() => setFilter(f)}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="cs-empty"><p>Loading complaints...</p></div>
          ) : filtered.length === 0 ? (
            <div className="cs-empty">
              <p>No complaints yet.</p>
              <span>Submit a complaint — it will appear here.</span>
            </div>
          ) : (
            <div className="cs-table-wrap">
              <table className="cs-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Title</th>
                    <th>Faculty</th>
                    <th>Category</th>
                    <th>Proof</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Admin Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c, i) => (
                    <tr key={c.id}>
                      <td style={{ color: "#b0a3d0", fontSize: "0.75rem", fontWeight: 700 }}>{i + 1}</td>
                      <td className="cs-td-title">{c.title}</td>
                      <td style={{ fontWeight: 600, color: "#4b4070" }}>{c.facultyName || "—"}</td>
                      <td>
                        <span className="cs-badge" style={catStyle[c.category]}>
                          {c.category}
                        </span>
                      </td>
                      <td>
                        {c.photoProof ? (
                          <button className="cs-proof-btn" onClick={() => setViewPhoto(c.photoProof)}>
                            <img src={c.photoProof} alt="proof" />
                          </button>
                        ) : (
                          <span className="cs-none">—</span>
                        )}
                      </td>
                      <td className="cs-td-date">{c.date}</td>
                      <td>
                        <span className={`cs-status ${getStatusClass(c.status)}`}>
                          {c.status}
                        </span>
                      </td>
                      <td className="cs-td-resp">
                        {c.adminResponse ? (
                          <div className={`cs-reason-box ${getStatusClass(c.status)}`}>
                            {c.adminResponse}
                          </div>
                        ) : (
                          <span className="cs-none">Awaiting review...</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {viewPhoto && <PhotoViewer src={viewPhoto} onClose={() => setViewPhoto(null)} />}
    </div>
  );
};

export default ComplaintStatus;