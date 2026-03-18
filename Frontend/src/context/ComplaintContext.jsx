import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthContext";
import { apiUrl } from "../utils/api";

const ComplaintContext = createContext();

export const ComplaintProvider = ({ children }) => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchStudentComplaints = async (studentId) => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(apiUrl(`/student/complaints/${studentId}`));
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to fetch complaints");
      }
      setComplaints(data.data || []);
    } catch (err) {
      setError(err.message || "Failed to fetch complaints");
    } finally {
      setLoading(false);
    }
  };

  const fetchAllComplaints = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(apiUrl("/admin/complaints"));
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to fetch complaints");
      }
      setComplaints(data.data || []);
    } catch (err) {
      setError(err.message || "Failed to fetch complaints");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      setComplaints([]);
      return;
    }

    if (user.role === "Student") {
      fetchStudentComplaints(user.user_id);
    } else if (user.role === "Admin") {
      fetchAllComplaints();
    } else {
      setComplaints([]);
    }
  }, [user]);

  const submitComplaint = async (complaint) => {
    if (!user?.user_id) {
      throw new Error("You must be logged in to submit a complaint");
    }
    if (!complaint.facultyId) {
      throw new Error("Please select a faculty");
    }

    const payload = {
      studentUserId: user.user_id,
      facultyId: complaint.facultyId,
      facultyName: complaint.facultyName,
      title: complaint.title,
      category: complaint.category,
      description: complaint.description,
      photoProof: complaint.photoProof || null,
    };

    const response = await fetch(apiUrl("/student/complaints"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || "Failed to submit complaint");
    }

    setComplaints((prev) => [data.data, ...prev]);
    return data.data;
  };

  const reviewComplaint = async (id, decision, reason, targetFacultyId) => {
    const response = await fetch(apiUrl(`/admin/complaints/${id}/review`), {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        decision,
        reason,
        targetFacultyId,
      }),
    });

    const data = await response.json();
    if (!response.ok || !data.success) {
      throw new Error(data.message || "Failed to review complaint");
    }

    const updatedComplaint = data.data;
    setComplaints((prev) =>
      prev.map((complaint) =>
        complaint.id === updatedComplaint.id ? updatedComplaint : complaint
      )
    );

    return updatedComplaint;
  };

  const value = useMemo(
    () => ({
      complaints,
      loading,
      error,
      submitComplaint,
      reviewComplaint,
      refreshComplaints:
        !user
          ? async () => {}
          : user.role === "Admin"
          ? fetchAllComplaints
          : () => fetchStudentComplaints(user?.user_id),
    }),
    [complaints, loading, error, user]
  );

  return (
    <ComplaintContext.Provider value={value}>
      {children}
    </ComplaintContext.Provider>
  );
};

export const useComplaints = () => useContext(ComplaintContext);
