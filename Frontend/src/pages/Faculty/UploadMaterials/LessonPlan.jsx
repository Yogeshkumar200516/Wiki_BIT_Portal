import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Button,
  Modal,
  TextField,
  Typography,
  Snackbar,
  Alert,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { Edit, Delete, Add, ArrowBack, LibraryAddRounded, AutoDeleteRounded } from "@mui/icons-material";
import image from "../../../assets/images/empty_state_icon.png";

function LessonPlan() {
  const { unitNumber } = useParams(); // Get unitNumber from the URL
  const navigate = useNavigate();
  const location = useLocation();
  const unitName = location.state?.unitName || "";

  const [lessonPlans, setLessonPlans] = useState([]); // List of lesson plans for the specific unit
  const [modalOpen, setModalOpen] = useState(false); // Modal state for adding/editing lesson plan
  const [currentPlan, setCurrentPlan] = useState({
    number: "",
    name: "",
    pdf: "",
    video: "",
    discourse: "",
  }); // Current lesson plan being edited/created
  const [isEdit, setIsEdit] = useState(false); // Edit mode
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [fileError, setFileError] = useState(false); // PDF file error

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false); // Delete confirmation dialog
  const [planToDelete, setPlanToDelete] = useState(null); // Store plan to delete

  // Load lesson plans from localStorage when the component is mounted
  useEffect(() => {
    // Retrieve lesson plans for the unit
    const storedPlans = JSON.parse(localStorage.getItem(`lessonPlans-${unitNumber}`));
    if (storedPlans) {
      setLessonPlans(storedPlans);
    }
  }, [unitNumber]);

  // Save lesson plans to localStorage whenever the lessonPlans state changes
  useEffect(() => {
    if (lessonPlans.length > 0) {
      localStorage.setItem(`lessonPlans-${unitNumber}`, JSON.stringify(lessonPlans));
    }

    // Set the hasChanges flag to true
  if (lessonPlans.length > 0) {
    localStorage.setItem(`hasChanges-${unitNumber}`, "true");
  }
  }, [lessonPlans, unitNumber]);

  // Open the modal for adding/editing a lesson plan
  const handleModalOpen = (plan = null) => {
    if (plan) {
      setCurrentPlan(plan);
      setIsEdit(true);
    } else {
      setCurrentPlan({ number: "", name: "", pdf: "", video: "", discourse: "" });
      setIsEdit(false);
    }
    setModalOpen(true);
  };

  // Close the modal
  const handleModalClose = () => {
    setModalOpen(false);
    setFileError(false);
  };

  // Handle file input change (PDF upload)
  // Handle file input change (PDF upload)
const handleFileChange = (e) => {
  const file = e.target.files[0];
  if (file && file.type === "application/pdf") {
    const fileURL = URL.createObjectURL(file); // Create a temporary URL for the file
    setCurrentPlan({ ...currentPlan, pdf: fileURL });
    setFileError(false);
  } else {
    setFileError(true);
  }
};


  // Handle saving a new or edited lesson plan
  const handleSavePlan = () => {
    // If editing the plan
    if (isEdit) {
      const updatedPlan = {
        ...currentPlan,
        status: currentPlan.status || "Pending", // Ensure a status is set
      };
  
      setLessonPlans((prevPlans) =>
        prevPlans.map((p) => (p.number === currentPlan.number ? updatedPlan : p))
      );
      setSnackbar({
        open: true,
        message: "Lesson plan updated successfully!",
        severity: "info",
      });
    } else {
      // If new plan, set the status to "Pending" by default
      const newPlan = { ...currentPlan, status: "Pending" };
  
      setLessonPlans((prevPlans) => [...prevPlans, newPlan]);
      setSnackbar({
        open: true,
        message: "Lesson plan added successfully!",
        severity: "success",
      });
    }
    handleModalClose();
  };
  

  // Handle deleting a lesson plan
  const handleDeletePlan = () => {
    const updatedPlans = lessonPlans.filter((p) => p.number !== planToDelete.number);
    setLessonPlans(updatedPlans); // Update state
    localStorage.setItem(`lessonPlans-${unitNumber}`, JSON.stringify(updatedPlans)); // Update localStorage
    setSnackbar({ open: true, message: "Lesson plan deleted successfully!", severity: "error" });
    setDeleteDialogOpen(false);
  };

  // Close the snackbar
  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Navigate back to the Upload page
  const handleBack = () => {
    navigate("/upload-materials");
  };

  // Table columns definition
  const columns = [
    { id: "number", label: "LP Number", minWidth: 100 },
    { id: "name", label: "Lesson Plan Title", minWidth: 170 },
    { id: "pdf", label: "Lecture Material", minWidth: 170 },
    { id: "video", label: "Lecture Video", minWidth: 170 },
    { id: "discourse", label: "Discourse Link", minWidth: 170 },
    { id: "status", label: "Status", minWidth: 170 },
    { id: "actions", label: "Actions", minWidth: 100 },
  ];

  // Table pagination state
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  return (
    <Box p={3} sx={{backgroundColor: '#f5f5f5', minHeight: 'calc(100vh - 60px)'}}>
      <Button
        startIcon={<ArrowBack />}
        onClick={handleBack}
        sx={{
          mb: 2,
          textTransform: "none",
          fontWeight: "bold",
          color: "#757575",
          '&:hover': {
            color: '#414141'
          }
        }}
      >
        Back to Units
      </Button>

      <Typography
        variant="h5"
        align="center"
        sx={{ mb: 2, fontWeight: 'bold', color: "#2d3a56", fontSize: {xs: '1rem', sm: '1.5rem'} }}
      >
        Unit {unitNumber}: <span style={{ color: "#673ab7" }}>{unitName}</span>
      </Typography>
      <Button
          variant="contained"
          onClick={() => handleModalOpen()}
          sx={{
            px: 1.5,
            py: 1,
            fontWeight: "bold",
            textTransform: "none",
            fontSize: {xs: '0.8rem', sm: '1rem'},
            backgroundColor: "#ede7f6",
            color: "#673ab7",
            borderRadius: "40px",
            border: "2px solid #673ab7",
            "&:hover": {
              backgroundColor: "#673ab7",
              color: "#fff",
            },
          }}
        >
          <LibraryAddRounded sx={{ mr: 1 }} /> Add Lesson Plan
        </Button>

        <Paper sx={{ width: "100%", overflow: "hidden", mt: "10px" }}>
  <TableContainer sx={{ height: {xs: '420px', sm: 'auto'} }}>
    <Table stickyHeader aria-label="sticky table">
      <TableHead>
        <TableRow>
          {columns.map((column) => (
            <TableCell
              key={column.id}
              style={{
                minWidth: column.minWidth,
                backgroundColor: "#673ab7", // Table header background color
                color: "#ffffff", // White text color
                fontWeight: "bold", // Bold text
                textAlign: "center", // Center align the header text
                padding: "22px 26px", // Padding for better spacing
              }}
            >
              {column.label}
            </TableCell>
          ))}
          
        </TableRow>
      </TableHead>
      <TableBody>
        {lessonPlans.length === 0 ? (
          <TableRow>
            <TableCell colSpan={9} align="center" sx={{ py: 4 }}>
              <Box display="flex" flexDirection="column" alignItems="center">
                <img
                  src={image}
                  alt="No Lesson Plans"
                  style={{ width: "150px", marginBottom: "15px", opacity: 0.6 }}
                />
                <Typography variant="h6" color="text.secondary">
                  No Lesson Plans Created Yet
                </Typography>
                <Typography variant="body2" color="text.secondary" mb={2}>
                  Click the "Add Lesson Plan" button to create your first lesson plan.
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => handleModalOpen()}
                  sx={{
                    p: 1.5,
                    fontWeight: "bold",
                    textTransform: "none",
                    fontSize: "1rem",
                    backgroundColor: "#ede7f6",
                    color: "#673ab7",
                    borderRadius: "20px",
                    border: "2px solid #673ab7",
                    "&:hover": {
                      backgroundColor: "#673ab7",
                      color: "#fff",
                    },
                  }}
                >
                  <LibraryAddRounded />
                </Button>
              </Box>
            </TableCell>
          </TableRow>
        ) : (
          lessonPlans
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            .map((plan) => (
              <TableRow hover key={plan.number}>
                <TableCell sx={{ padding: "16px", textAlign: "center", fontWeight: 'bold', color: '#757575' }}>
                  {plan.number}
                </TableCell>
                <TableCell sx={{ padding: "16px", textAlign: "center", fontWeight: 'bold', color: '#757575' }}>
                  {plan.name}
                </TableCell>
                <TableCell sx={{ padding: "16px", textAlign: "center" }}>
  {plan.pdf ? (
    <Box display="flex" flexDirection="column" alignItems="center">
      <Typography
        variant="body2"
        sx={{
          wordWrap: "break-word",
          whiteSpace: "normal",
          fontWeight: "bold",
          fontSize: "0.875rem",
          color: "#3f51b5",
          cursor: "pointer",
        }}
        onClick={() => window.open(plan.pdf, "_blank")} // Open in a new tab
      >
        View PDF
      </Typography>
    </Box>
  ) : (
    <Typography variant="body2" color="text.secondary">
      No lecture material uploaded
    </Typography>
  )}
</TableCell>

                <TableCell sx={{ padding: "16px", textAlign: "center" }}>
                  {plan.video ? (
                    <Box display="flex" flexDirection="column" alignItems="center">
                      <Typography
                        variant="body2"
                        sx={{
                          wordWrap: "break-word",
                          whiteSpace: "normal",
                          fontWeight: "bold",
                          fontSize: "0.875rem",
                          color: "#3f51b5",
                          cursor: "pointer",
                        }}
                        onClick={() => window.open(plan.video, "_blank")}
                      >
                        View Video
                      </Typography>
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No lecture video uploaded
                    </Typography>
                  )}
                </TableCell>
                <TableCell sx={{ padding: "16px", textAlign: "center" }}>
                  {plan.discourse ? (
                    <Box display="flex" flexDirection="column" alignItems="center">
                      <Typography
                        variant="body2"
                        sx={{
                          wordWrap: "break-word",
                          whiteSpace: "normal",
                          fontWeight: "bold",
                          fontSize: "0.875rem",
                          color: "#3f51b5",
                          cursor: "pointer",
                        }}
                        onClick={() => window.open(plan.discourse, "_blank")}
                      >
                        View Discourse
                      </Typography>
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No discourse link uploaded
                    </Typography>
                  )}
                </TableCell>
                {/* Status Column with dynamic color and icon */}
                <TableCell sx={{ padding: "16px", textAlign: "center" }}>
  <Typography
    variant="body2"
    sx={{
      fontWeight: "bold",
      fontSize: "0.875rem",
      color: "#fff",
      backgroundColor:
        plan.status === "Approved"
          ? "#1b5e20" // Green for approved
          : plan.status === "Rejected"
          ? "#b71c1c" // Red for rejected
          : "#f57f17", // Yellow for pending
      padding: "4px 8px",
      borderRadius: "12px",
      display: "inline-block",
    }}
  >
    {plan.status || "Pending"}
  </Typography>
</TableCell>

                <TableCell sx={{ padding: "16px", textAlign: "center" }}>
                  <Box display="flex" justifyContent="center" alignItems="center">
                    <IconButton
                      color="primary"
                      onClick={() => handleModalOpen(plan)}
                      sx={{
                        color: "#673ab7",
                        fontSize: { xs: "0.6rem", sm: "1rem" },
                        border: "2px solid #673ab7",
                        backgroundColor: "#fff",
                        "&:hover": { backgroundColor: "#673ab7", color: "#fff" },
                      }}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => {
                        setPlanToDelete(plan);
                        setDeleteDialogOpen(true);
                      }}
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
            ))
        )}
      </TableBody>
    </Table>
  </TableContainer>
  <TablePagination
    rowsPerPageOptions={[10, 25, 100]}
    component="div"
    count={lessonPlans.length}
    rowsPerPage={rowsPerPage}
    page={page}
    onPageChange={handleChangePage}
    onRowsPerPageChange={handleChangeRowsPerPage}
  />
</Paper>

<Typography sx={{color: 'red', fontWeight: 'bold', opacity: 0.3, mt: 4, textAlign: 'left' }}>
        Note : Lesson Plans created will be only for Unit {unitNumber} and will be displayed to the students only after getting approval from Incharge faculty.
      </Typography>



      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle sx={{color: '#673ab7', fontWeight: 'bold', }}>Delete Lesson Plan !</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{color: '#616161', fontWeight: 'bold'}}>
            Are you sure you want to delete this lesson plan for Unit {unitNumber} ? All Lecture Materials and Videos associated with this lesson plan will also be deleted. {/*- Lesson Plan {planToDelete?.number}?*/}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{mr: '20px', mb: '10px'}}>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary" sx={{textTransform: 'none', fontWeight: 'bold', color: '#616161'}}>
            Cancel
          </Button>
          <Button onClick={handleDeletePlan} color="error"
          sx={{textTransform: 'none', fontWeight: 'bold', color: '#b71c1c', backgroundColor: '#fff', border: '2px solid #b71c1c', 
            '&:hover': {
                backgroundColor: '#b71c1c', // Light purple background on hover
                color: '#fff',
              },
          }}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal for Adding/Editing Lesson Plan */}
      <Modal open={modalOpen} onClose={handleModalClose}>
  <Box
    bgcolor="background.paper"
    borderRadius={3}
    boxShadow={24}
    position="absolute"
    top="50%"
    left="50%"
    sx={{
      transform: "translate(-50%, -50%)",
      p: { xs: 3, sm: 4 },
      width: { xs: "90%", sm: "500px" },
      maxWidth: "600px",
      textAlign: "center",
    }}
  >
    <Typography
      variant="h5"
      gutterBottom
      sx={{
        color: "#673ab7",
        fontWeight: "bold",
        mb: 2,
        fontSize: { xs: "1.5rem", sm: "2rem" },
      }}
    >
      {isEdit ? "Edit Lesson Plan" : "Add Lesson Plan"}
    </Typography>

    <TextField
      label="Lesson Plan Number"
      value={currentPlan.number}
      onChange={(e) => setCurrentPlan({ ...currentPlan, number: e.target.value })}
      fullWidth
      margin="normal"
      sx={{
        "& .MuiInputLabel-root": { color: "#616161", fontWeight: "bold" },
        "& .MuiOutlinedInput-root": {
          borderRadius: "12px",
        },
      }}
    />

    <TextField
      label="Lesson Plan Name"
      value={currentPlan.name}
      onChange={(e) => setCurrentPlan({ ...currentPlan, name: e.target.value })}
      fullWidth
      margin="normal"
      sx={{
        "& .MuiInputLabel-root": { color: "#616161", fontWeight: "bold" },
        "& .MuiOutlinedInput-root": {
          borderRadius: "12px",
        },
      }}
    />

    {/* File Upload */}
    <Box
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      sx={{
        mt: 3,
        px: 2,
        py: 1,
        border: "2px dashed #673ab7",
        borderRadius: "12px",
        backgroundColor: "#f3e5f5",
      }}
    >
      <Typography
        variant="body1"
        sx={{
          color: "#673ab7",
          fontWeight: "bold",
          textAlign: "left",
          width: "75%",
        }}
      >
        {currentPlan.pdf ? currentPlan.pdf : "No PDF uploaded"}
      </Typography>
      <Button
        variant="contained"
        component="label"
        sx={{
          textTransform: "none",
          backgroundColor: "#ede7f6",
          color: "#673ab7",
          fontWeight: "bold",
          "&:hover": {
            backgroundColor: "#673ab7",
            color: "#fff",
          },
        }}
      >
        Upload
        <input
          type="file"
          hidden
          accept="application/pdf"
          onChange={handleFileChange}
        />
      </Button>
    </Box>

    {fileError && (
      <Typography color="error" variant="body2" mt={1}>
        Please upload a valid PDF file.
      </Typography>
    )}

    <TextField
      label="Video URL"
      value={currentPlan.video}
      onChange={(e) => setCurrentPlan({ ...currentPlan, video: e.target.value })}
      fullWidth
      margin="normal"
      sx={{
        "& .MuiInputLabel-root": { color: "#616161", fontWeight: "bold" },
        "& .MuiOutlinedInput-root": {
          borderRadius: "12px",
        },
      }}
    />

    <TextField
      label="Discourse Link"
      value={currentPlan.discourse}
      onChange={(e) => setCurrentPlan({ ...currentPlan, discourse: e.target.value })}
      fullWidth
      margin="normal"
      sx={{
        "& .MuiInputLabel-root": { color: "#616161", fontWeight: "bold" },
        "& .MuiOutlinedInput-root": {
          borderRadius: "12px",
        },
      }}
    />

    <Box mt={4} display="flex" sx={{justifyContent: 'right', gap: '10px'}}>
      <Button
        onClick={handleModalClose}
        sx={{
          color: "#757575",
          fontWeight: "bold",
          textTransform: "none",
          "&:hover": {
            backgroundColor: "#ffcdd2",
            color: '#b71c1c',
          },
        }}
      >
        Cancel
      </Button>
      <Button
        variant="contained"
        onClick={handleSavePlan}
        sx={{
          textTransform: "none",
          fontWeight: "bold",
          backgroundColor: "#fff",
          color: "#673ab7",
          border: '2px solid #673ab7',
          "&:hover": {
            backgroundColor: "#673ab7",
            color: '#fff',
          },
        }}
      >
        Save
      </Button>
    </Box>
  </Box>
</Modal>


      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default LessonPlan;
