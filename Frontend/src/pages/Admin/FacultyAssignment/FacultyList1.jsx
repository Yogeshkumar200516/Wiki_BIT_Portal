import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Box,
  Typography,
  Snackbar,
  Alert,
  Modal,
  Button,
  Paper,
  TablePagination,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { AutoDeleteRounded } from "@mui/icons-material";

const AssignedFacultiesTable = ({ onDelete, onEdit, onStatusChange }) => {
  const [assignments, setAssignments] = useState([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [deleteIndex, setDeleteIndex] = useState(null);
  const [deleteAssignmentId, setDeleteAssignmentId] = useState(null);  // State to hold the assignment ID for deletion
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  
  const fetchAssignments = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/admin/faculty-courses");
      const data = await response.json();
      if (data.success) {
        setAssignments(data.data);
      } else {
        setSnackbarMessage(data.message);
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }
    } catch (error) {
      setSnackbarMessage("Failed to fetch assignments.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };
  
  useEffect(() => {
    fetchAssignments();
  }, []); // Run once on mount
  
  const confirmDelete = async () => {
    if (!deleteAssignmentId) return;
    try {
      await handleDelete(deleteAssignmentId);
      setDeleteModalOpen(false);
      setSnackbarMessage("Assignment deleted successfully.");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
      fetchAssignments();  // **Refetch the list after deletion**
    } catch (error) {
      setSnackbarMessage("Failed to delete assignment.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };
  
  const formatDate = (date) => {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(date).toLocaleDateString('en-GB', options);
  };

  const calculateRemainingDays = (deadline) => {
    const currentDate = new Date();
    const deadlineDate = new Date(deadline);
    const timeDifference = deadlineDate - currentDate;
    const remainingDays = Math.ceil(timeDifference / (1000 * 3600 * 24)); // Convert ms to days
    return remainingDays;
  };

  const handleDeleteConfirmation = (assignmentId) => {
    setDeleteAssignmentId(assignmentId);
    setDeleteModalOpen(true);
  };

  const handleDelete = async (assignmentId) => {
    try {
      const response = await axios.delete(`http://localhost:5000/api/admin/delete-assignment/${assignmentId}`);
      if (response.status === 200) {
        console.log("Assignment deleted successfully.");
      } else {
        console.error("Failed to delete assignment.");
      }
    } catch (error) {
      console.error("Error occurred during deletion:", error);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  useEffect(() => {
    if (assignments.length > 0 && page > 0 && page * rowsPerPage >= assignments.length) {
      setPage((prevPage) => Math.max(0, prevPage - 1));
    }
  }, [assignments, page, rowsPerPage]);

  // Helper function to format faculty name and ID
  const formatFacultyName = (facultyId, facultyName) => {
    return `${facultyName} (${facultyId})`;
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" gutterBottom sx={{ color: "#424242", fontWeight: "bold" }}>
        Faculties Assigned for the Courses
      </Typography>
      <Paper sx={{ overflow: "hidden" }}>
        <TableContainer sx={{ maxHeight: "400px" }}>
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                {[
                  "Course Code",
                  "Course Name",
                  "Incharge",
                  "Creating Faculties",
                  "Assigned At",
                  "Deadline",
                  "Actions",
                ].map((header) => (
                  <TableCell
                    key={header}
                    style={{
                      backgroundColor: "#673ab7", // Header background
                      color: "#ffffff", // White text color
                      fontWeight: "bold",
                      textAlign: "center",
                      padding: "22px 26px",
                    }}
                  >
                    {header}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {assignments
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((assignment, index) => {
                  const formattedDeadline = formatDate(assignment.deadline_date);
                  const remainingDays = calculateRemainingDays(assignment.deadline_date);

                  return (
                    <TableRow hover key={index}>
                      <TableCell sx={{ padding: "16px", textAlign: "center", fontWeight: "bold", color: "#757575" }}>
                        {assignment.course_code}
                      </TableCell>
                      <TableCell sx={{ padding: "16px", textAlign: "center", fontWeight: "bold", color: "#757575" }}>
                        {assignment.course_name}
                      </TableCell>

                      {/* Displaying Incharge Faculty Name and ID */}
                      <TableCell sx={{ padding: "16px", textAlign: "center", fontWeight: "bold", color: "#757575" }}>
                        {formatFacultyName(assignment.incharge_faculty_id, assignment.incharge_faculty_name)}
                      </TableCell>

                      {/* Displaying Creating Faculties Name and ID */}
                      <TableCell sx={{ padding: "16px", fontWeight: "bold", color: "#757575", textAlign: "center" }}>
                        {assignment.creating_faculties
                          ? assignment.creating_faculties
                              .split(",") // Split the string of names into an array
                              .map((facultyName, index) => `${facultyName.trim()} (${assignment.wetting_faculty_ids[index] || "N/A"})`)
                              .join(", ")
                          : "No creating faculties assigned"}
                      </TableCell>

                      <TableCell sx={{ padding: "16px", textAlign: "center", fontWeight: "bold", color: "#757575" }}>
                        {assignment.created_at
                          ? new Date(assignment.created_at).toLocaleDateString('en-GB') // Format as dd/mm/yyyy
                          : "N/A"}
                      </TableCell>

                      {/* Displaying Deadline with Remaining Days */}
                      <TableCell sx={{ padding: "16px", textAlign: "center", fontWeight: "bold", color: "#757575" }}>
                        {formattedDeadline}{" "}
                        <span style={{ color: "#b71c1c", fontWeight: "bold", opacity: 0.8 }}>
                          ({remainingDays} {remainingDays === 1 ? "day" : "days"} left)
                        </span>
                      </TableCell>

                      <TableCell sx={{ padding: "16px", textAlign: "center" }}>
                        <Box display="flex" justifyContent="center" alignItems="center">
                          <IconButton
                            color="primary"
                            onClick={() => onEdit(index)}
                            sx={{
                              color: "#673ab7",
                              fontSize: { xs: "0.6rem", sm: "1rem" },
                              border: "2px solid #673ab7",
                              backgroundColor: "#fff",
                              "&:hover": { backgroundColor: "#673ab7", color: "#fff" },
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            color="error"
                            onClick={() => handleDeleteConfirmation(assignment.id)}
                            sx={{
                              color: "#b71c1c",
                              ml: { xs: "5px", sm: "10px" },
                              fontSize: { xs: "0.6rem", sm: "1rem" },
                              border: "2px solid #b71c1c",
                              backgroundColor: "#fff",
                              "&:hover": { backgroundColor: "#b71c1c", color: "#fff" },
                            }}
                          >
                            <AutoDeleteRounded />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <TablePagination
          rowsPerPageOptions={[20, 50, 100]}
          component="div"
          count={assignments.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Delete Confirmation Modal */}
      <Modal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "90%", sm: 500 }, // Responsive width for mobiles and tablets
            bgcolor: "background.paper",
            p: 3,
            borderRadius: 2,
            boxShadow: 24,
          }}
        >
          <Typography variant="h6" gutterBottom sx={{ color: "#673ab7", fontWeight: "bold" }}>
            Delete this Assignment!
          </Typography>
          <Typography variant="body1" gutterBottom sx={{ color: "#757575", fontWeight: "bold" }}>
            Are you sure you want to delete this assignment? The assignments will not be regained after deletion.
          </Typography>
          <Box sx={{ display: "flex", justifyContent: "right", mt: 2, gap: "10px" }}>
            <Button
              variant="contained"
              onClick={confirmDelete}
              sx={{
                color: "#673ab7",
                fontWeight: "bold",
                textTransform: "none",
                backgroundColor: "#fff",
                border: "2px solid #673ab7",
                "&:hover": {
                  backgroundColor: "#673ab7",
                  color: "#fff",
                },
              }}
            >
              Delete
            </Button>
            <Button
              onClick={() => setDeleteModalOpen(false)}
              sx={{ color: "#757575", textTransform: "none", fontWeight: "bold", "&:hover": { color: "#424242" } }}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: "100%" }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AssignedFacultiesTable;
