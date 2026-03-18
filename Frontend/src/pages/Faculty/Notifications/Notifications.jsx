import React, { useEffect, useMemo } from "react";
import "./Notifications.css";
import { useFacultyscore } from "../../../context/FacultyscoreContext";
import { useAuth } from "../../../context/AuthContext";

const Notifications = () => {
  const { user } = useAuth();
  const {
    getFacultyById,
    getNotificationsForFaculty,
    getUnreadCount,
    markNotificationRead,
    markAllRead,
    refreshNotifications,
    loadingNotifications,
  } = useFacultyscore();

  const currentFacultyId = user?.user_id || "";
  const faculty = getFacultyById(currentFacultyId);
  const notifications = getNotificationsForFaculty(currentFacultyId);
  const unreadCount = getUnreadCount(currentFacultyId);

  useEffect(() => {
    if (currentFacultyId) {
      refreshNotifications(currentFacultyId);
    }
  }, [currentFacultyId]);

  const displayNotifications = useMemo(() => {
    return notifications.map((notification) => {
      const message =
        notification.message ||
        `Complaint "${notification.complaintTitle}" reviewed by admin.`;
      const inferredAlert =
        message.toLowerCase().includes("score") &&
        message.toLowerCase().includes("below 80");
      const status = notification.status || (inferredAlert ? "Alert" : "Approved");
      return { ...notification, message, status };
    });
  }, [notifications]);

  const formatDate = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "-" : date.toLocaleString();
  };

  const scoreColor =
    faculty?.score >= 90 ? "#059669" :
    faculty?.score >= 70 ? "#d97706" : "#dc2626";

  const scoreGradient =
    faculty?.score >= 90 ? "linear-gradient(90deg,#10b981,#34d399)" :
    faculty?.score >= 70 ? "linear-gradient(90deg,#f59e0b,#fbbf24)" :
                           "linear-gradient(90deg,#ef4444,#f97316)";

  const scoreLabel =
    faculty?.score >= 90 ? "Excellent" :
    faculty?.score >= 70 ? "Average" : "Needs Review";

  // Status icon map
  const statusIcon = {
    approved: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    ),
    rejected: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    ),
    pending: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
    alert: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    ),
  };

  return (
    <div className="fn-page">

      {/* ── HEADER ── */}
      <div className="fn-heading">
        <div className="fn-heading-left">
          <p className="fn-eyebrow">Faculty Portal</p>
          <h1>Notifications</h1>
          <p className="fn-sub">Complaint reviews and performance alerts delivered in real time.</p>
        </div>
        <div className="fn-heading-right">
          {unreadCount > 0 && (
            <div className="fn-unread-badge">
              <span className="fn-unread-dot" />
              {unreadCount} unread
            </div>
          )}
          {unreadCount > 0 && (
            <button className="fn-mark-all" onClick={() => markAllRead(currentFacultyId)}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Mark all read
            </button>
          )}
        </div>
      </div>

      {/* ── SCORE CARD ── */}
      {faculty && (
        <div className="fn-score-card">
          <div className="fn-score-left">
            <div className="fn-score-avatar">
              {faculty.name?.charAt(0) || "F"}
              <div className="fn-avatar-ring" />
            </div>
            <div>
              <div className="fn-score-name">{faculty.name}</div>
              <div className="fn-score-dept">{faculty.department}</div>
            </div>
          </div>

          <div className="fn-score-center">
            <div className="fn-score-track-wrap">
              <div className="fn-score-track">
                <div
                  className="fn-score-bar"
                  style={{ width: `${faculty.score}%`, background: scoreGradient }}
                />
              </div>
              <div className="fn-score-markers">
                <span>0</span><span>25</span><span>50</span><span>75</span><span>100</span>
              </div>
            </div>
          </div>

          <div className="fn-score-right">
            <div className="fn-score-num" style={{ color: scoreColor }}>
              {faculty.score}
            </div>
            <div className="fn-score-label">Current Score</div>
            <div className={`fn-score-status-pill ${faculty.score >= 90 ? "excellent" : faculty.score >= 70 ? "average" : "risk"}`}>
              {scoreLabel}
            </div>
          </div>
        </div>
      )}

      {/* ── NOTIFICATION LIST ── */}
      {loadingNotifications ? (
        <div className="fn-empty">
          <div className="fn-empty-spinner" />
          <p>Loading notifications…</p>
          <span>Fetching your latest updates</span>
        </div>
      ) : displayNotifications.length === 0 ? (
        <div className="fn-empty">
          <div className="fn-empty-icon-wrap">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#5c35d9" strokeWidth="1.8">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
              <path d="M13.73 21a2 2 0 01-3.46 0"/>
            </svg>
          </div>
          <p>No notifications yet</p>
          <span>Approved or rejected complaints will appear here.</span>
        </div>
      ) : (
        <div className="fn-list">
          {displayNotifications.map((notification, idx) => {
            const statusKey = String(notification.status || "")
              .toLowerCase()
              .replace(/\s+/g, "-");
            const isComplaint = String(notification.contextType || "").toLowerCase() === "complaint";
            const fromLabel = isComplaint ? "Student" : "Admin";
            const fromInitial = isComplaint ? "S" : "A";
            return (
              <div
                key={notification.id}
                className={`fn-card ${notification.read ? "read" : "unread"} fn-status-${statusKey}`}
                style={{ animationDelay: `${idx * 55}ms` }}
                onClick={() => !notification.read && markNotificationRead(notification.id)}
              >
                {/* Left accent bar */}
                <div className="fn-card-accent" />

                {/* Unread dot */}
                {!notification.read && <span className="fn-dot" />}

                <div className="fn-card-inner">
                  {/* Header */}
                  <div className="fn-card-header">
                    <div className="fn-card-title">
                      <div className="fn-card-from">
                        <div className="fn-from-avatar">
                          {fromInitial}
                        </div>
                        <span className="fn-card-student">
                          {fromLabel}
                        </span>
                      </div>
                      <span className="fn-card-complaint">
                        {notification.complaintTitle || "Notification"}
                      </span>
                    </div>
                    <span className={`fn-status ${statusKey}`}>
                      {statusIcon[statusKey] || null}
                      {notification.status}
                    </span>
                  </div>

                  {/* Message */}
                  <p className="fn-card-message">{notification.message}</p>

                  {/* Meta */}
                  <div className="fn-card-meta">
                    <div className="fn-card-meta-left">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                      </svg>
                      <span className="fn-card-time">{formatDate(notification.timestamp)}</span>
                    </div>
                    {notification.adminResponse && notification.adminResponse !== "-" && (
                      <div className="fn-admin-feedback">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                        </svg>
                        <span>{notification.adminResponse}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Notifications;
