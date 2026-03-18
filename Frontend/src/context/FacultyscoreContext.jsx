import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useAuth } from "./AuthContext";
import { apiUrl } from "../utils/api";

const FacultyscoreContext = createContext();

export const FacultyscoreProvider = ({ children }) => {
  const { user } = useAuth();
  const [faculties, setFaculties] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loadingFaculties, setLoadingFaculties] = useState(false);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  const refreshFaculties = useCallback(async () => {
    setLoadingFaculties(true);
    try {
      const response = await fetch(apiUrl("/admin/faculty-scores"));
      const data = await response.json();
      if (response.ok && data.success) {
        setFaculties(data.data || []);
      }
    } finally {
      setLoadingFaculties(false);
    }
  }, []);

  const refreshNotifications = useCallback(async (facultyId) => {
    if (!facultyId) {
      setNotifications([]);
      return;
    }

    setLoadingNotifications(true);
    try {
      const response = await fetch(apiUrl(`/faculty/notifications/${facultyId}`));
      const data = await response.json();
      if (response.ok && data.success) {
        setNotifications(data.data || []);
      }
    } finally {
      setLoadingNotifications(false);
    }
  }, []);

  useEffect(() => {
    if (!user) {
      setFaculties([]);
      setNotifications([]);
      return;
    }

    if (user.role === "Admin" || user.role === "Faculty") {
      refreshFaculties();
    }

    if (user.role === "Faculty") {
      refreshNotifications(user.user_id);
    }
  }, [user]);

  const markNotificationRead = useCallback(async (id) => {
    await fetch(apiUrl(`/faculty/notifications/${id}/read`), { method: "PUT" });
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  }, []);

  const markAllRead = useCallback(async (facultyId) => {
    await fetch(apiUrl(`/faculty/notifications/read-all/${facultyId}`), { method: "PUT" });
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })));
  }, []);

  const getFacultyById = useCallback(
    (id) => faculties.find((faculty) => faculty.id === id),
    [faculties]
  );

  const getNotificationsForFaculty = useCallback(
    (facultyId) => notifications.filter((notification) => notification.facultyId === facultyId),
    [notifications]
  );

  const getUnreadCount = useCallback(
    (facultyId) =>
      notifications.filter(
        (notification) => notification.facultyId === facultyId && !notification.read
      ).length,
    [notifications]
  );

  const value = useMemo(
    () => ({
      faculties,
      notifications,
      loadingFaculties,
      loadingNotifications,
      refreshFaculties,
      refreshNotifications,
      markNotificationRead,
      markAllRead,
      getFacultyById,
      getNotificationsForFaculty,
      getUnreadCount,
    }),
    [
      faculties,
      notifications,
      loadingFaculties,
      loadingNotifications,
      refreshFaculties,
      refreshNotifications,
      markNotificationRead,
      markAllRead,
      getFacultyById,
      getNotificationsForFaculty,
      getUnreadCount,
    ]
  );

  return (
    <FacultyscoreContext.Provider value={value}>
      {children}
    </FacultyscoreContext.Provider>
  );
};

export const useFacultyscore = () => useContext(FacultyscoreContext);
