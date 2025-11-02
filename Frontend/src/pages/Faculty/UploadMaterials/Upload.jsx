import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  IconButton,
  Modal,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Snackbar,
  Alert,
  Grid,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { Edit, Delete, Add, AutoDeleteRounded, LibraryAddRounded, ScheduleSendRounded, UploadFile, CloudUploadRounded, InfoRounded, CalendarMonthRounded } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import image from '../../../assets/images/empty_state_icon.png';
import UnitInfo from "../../../components/DownloadPDF/UnitInfo";
import UnitCard from "./UnitCard";
import UnitDetailsModal from "./UnitDetailsModal";
import UnitModal from "./UnitCreateModal";
import { useAuth } from "../../../context/AuthContext.jsx";
import axios from "axios";

function Upload() {
  const [units, setUnits] = useState([]); // List of units
  const [modalOpen, setModalOpen] = useState(false); // Modal state
  const [currentUnit, setCurrentUnit] = useState({ number: "", name: "" }); // Current unit being edited/created
  const [isEdit, setIsEdit] = useState(false); // Edit mode
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false); // Delete confirmation dialog
  const [unitToDelete, setUnitToDelete] = useState(null); // Unit to be deleted
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [unitError, setUnitError] = useState({ number: false, name: false });
  const navigate = useNavigate();
  const { user } = useAuth();

  const [uploadModalOpen, setUploadModalOpen] = useState(false);
const [selectedUnit, setSelectedUnit] = useState(null);
const [uploadedUnits, setUploadedUnits] = useState([]);
const [detailsModalOpen, setDetailsModalOpen] = useState(false);
const [unitDetails, setUnitDetails] = useState(null);
const [isConfirmationOpen, setIsConfirmationOpen] = useState(false); // State to track modal visibility
  const [confirmationAction, setConfirmationAction] = useState(""); // To track action type (add/edit)

const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    // Extract first course details (assuming faculty is assigned to one course at a time)
    const courseName = courses.length > 0 ? courses[0].course_name : "No Course Assigned";
    const courseCode = courses.length > 0 ? courses[0].course_code : "---";
    const courseId = courses.length > 0 ? courses[0].course_mapping_id : "---";
    const deadline =
    courses.length > 0
      ? new Date(courses[0].deadline_date).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        })
      : "No Deadline";    // Calculate Days Remaining
      const today = new Date();
      const [day, month, year] = deadline.split('/'); // Extract dd, mm, yyyy
      const deadlineDate = new Date(`${year}-${month}-${day}T00:00:00`); // Convert to YYYY-MM-DD format (ISO standard)
      
      // Calculate the remaining days
      const timeDifference = deadlineDate - today;
      const daysRemaining = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

      const deadlineMessage = daysRemaining > 0 
    ? `Deadline in ${daysRemaining} days` 
    : `Deadline passed ${Math.abs(daysRemaining)} days ago`;


    useEffect(() => {
        const fetchCourses = async () => {
            if (!user?.user_id) return; // Ensure user_id exists
            try {
                const response = await axios.get(`http://localhost:4000/api/faculty/wetting-faculty/${user.user_id}`);
                setCourses(response.data.data); // Store courses in state
            } catch (error) {
                console.error("Error fetching courses:", error);
                setCourses([]); // Set empty if error occurs
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, [user?.user_id]); // Runs when user_id changes


  const handleOpenConfirmation = (actionType) => {
    setConfirmationAction(actionType); // Set action type: "add" or "edit"
    setIsConfirmationOpen(true); // Open the modal
  };

  const handleCloseConfirmation = () => {
    setIsConfirmationOpen(false); // Close the modal
  };

  const handleConfirmAction = () => {
    setIsConfirmationOpen(false); // Close the modal
    handleSaveUnit(); // Call the save or update function
  };

  const handleSaveUnit = () => {
    const now = new Date().toISOString(); // Current date and time in ISO format

    // Check if the unit number is already taken
    const isDuplicateNumber = units.some((unit) => unit.number === currentUnit.number);

    if (isDuplicateNumber && !isEdit) {
      setSnackbar({
        open: true,
        message: `Unit number ${currentUnit.number} already exists. Please select another number.`,
        severity: "error",
      });
      return;
    }

    if (isEdit) {
      setUnits((prevUnits) =>
        prevUnits.map((u) =>
          u.number === currentUnit.number
            ? { ...currentUnit, lastUpdated: now }
            : u
        )
      );

      setSnackbar({
        open: true,
        message: "Unit updated successfully!",
        severity: "info",
      });
    } else {
      setUnits((prevUnits) => [
        ...prevUnits,
        { ...currentUnit, status: "Pending", created: now, lastUpdated: now },
      ]);

      setSnackbar({
        open: true,
        message: "Unit added successfully!",
        severity: "success",
      });
    }

    localStorage.setItem("units", JSON.stringify([...units]));
    handleModalClose();
  };

const handleDetailsModalOpen = (unit) => {
  setUnitDetails({
    number: unit.number,
    name: unit.name,
    introduction: unit.introduction || "N/A",
    summary: unit.summary || "N/A",
    mindMap: unit.mindMap || "Not uploaded",
    references: unit.references || "N/A",
    objectives: unit.objectives || "N/A",
    outcomes: unit.outcomes || "N/A",
    lastUpdated: unit.lastUpdated || "N/A",
    created: unit.created || "N/A",
    lessonPlanCount:
      JSON.parse(localStorage.getItem(`lessonPlans-${unit.number}`))?.length ||
      0,
  });
  setDetailsModalOpen(true);
};

const handleDetailsModalClose = () => {
  setDetailsModalOpen(false);
};


useEffect(() => {
  const savedUnits = JSON.parse(localStorage.getItem("uploadedUnits")) || [];
  setUploadedUnits(savedUnits);
}, []);

const handleUploadClick = (unit) => {
  setSelectedUnit(unit);
  setUploadModalOpen(true);
};

 // Handle upload confirmation
 const handleUploadConfirm = async () => {
  if (selectedUnit) {
    try {
      console.log("Selected Unit Data:", selectedUnit); // Debugging

      const unitData = {
        course_mapping_id: courseId,
        faculty_id: user?.user_id,
        unit_number: selectedUnit.number,
        unit_name: selectedUnit.name,
        introduction: selectedUnit.introduction || "",
        summary: selectedUnit.summary || "",
        reference: selectedUnit.references || "",
        mind_map: selectedUnit.mindMap || "",
        objective: selectedUnit.objectives || "",
        outcomes: selectedUnit.outcomes || "",
        approval_status: "Pending",
      };

      if (!courseId) {
        console.error("❌ course_mapping_id is missing!");
        setSnackbar({
          open: true,
          message: "Error: Course Mapping ID is missing.",
          severity: "error",
        });
        return;
      }

      const response = await fetch("http://localhost:4000/api/faculty/unit-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(unitData),
      });

      if (!response.ok) {
        throw new Error("Failed to upload unit");
      }

      const responseData = await response.json();
      console.log("✅ Upload successful:", responseData);

      // Update uploadedUnits state
      const updatedUploadedUnits = [...uploadedUnits, selectedUnit.number];
      setUploadedUnits(updatedUploadedUnits);
      localStorage.setItem("uploadedUnits", JSON.stringify(updatedUploadedUnits));

      // Reset change tracking after successful upload
      localStorage.setItem(`hasChanges-${selectedUnit.number}`, "false");

      setUploadModalOpen(false);
      setSnackbar({
        open: true,
        message: `Unit ${selectedUnit.number} uploaded successfully!`,
        severity: "success",
      });
    } catch (error) {
      console.error("Upload failed:", error);
      setSnackbar({
        open: true,
        message: "Failed to upload unit. Please try again.",
        severity: "error",
      });
    }
  }
};
//  const handleUploadConfirm = () => {
//   if (selectedUnit) {
//     const updatedUploadedUnits = [...uploadedUnits, selectedUnit.number];
//     setUploadedUnits(updatedUploadedUnits);

//     // Update localStorage
//     localStorage.setItem("uploadedUnits", JSON.stringify(updatedUploadedUnits));
//     localStorage.setItem(`hasChanges-${selectedUnit.number}`, "false"); // Reset change flag

//     setUploadModalOpen(false);
//     setSnackbar({
//       open: true,
//       message: `Unit ${selectedUnit.number} and corresponding lesson plans uploaded successfully!`,
//       severity: "success",
//     });
//   }
// };


useEffect(() => {
  const checkForChanges = () => {
    if (selectedUnit) {
      const hasChanges = localStorage.getItem(`hasChanges-${selectedUnit.number}`) === "true";
      if (hasChanges) {
        // Remove the unit from the uploaded list to enable the "Upload" button
        setUploadedUnits((prevUnits) =>
          prevUnits.filter((unit) => unit !== selectedUnit.number)
        );
      }
    }
  };

  // Check changes on page load
  checkForChanges();

  // Listen for localStorage changes
  window.addEventListener("storage", checkForChanges);

  // Cleanup listener
  return () => {
    window.removeEventListener("storage", checkForChanges);
  };
}, [selectedUnit]);



  // Load units from localStorage on component mount
  useEffect(() => {
    const storedUnits = JSON.parse(localStorage.getItem("units"));
    if (storedUnits) {
      setUnits(storedUnits);
    }
  }, []);

  // Save units to localStorage whenever units change
  useEffect(() => {
    if (units.length > 0) {
      localStorage.setItem("units", JSON.stringify(units));
    }
  }, [units]);

  const handleModalOpen = (unit = null) => {
    if (unit) {
      setCurrentUnit(unit); // Load the current unit details into the modal
      setIsEdit(true); // Set edit mode to true
    } else {
      setCurrentUnit({ number: "", name: "" }); // Reset to empty unit for new unit
      setIsEdit(false); // Set edit mode to false
    }
    setModalOpen(true);
    localStorage.setItem(`hasChanges-${unit.number}`, "true");
  };
  

  const handleModalClose = () => {
    setModalOpen(false);
  };

  const handleDeleteDialogOpen = (unit) => {
    setUnitToDelete(unit);
    setDeleteDialogOpen(true);
  };

  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  
  
  
  // Handle delete unit
  const handleDeleteUnit = () => {
    // Remove the unit from the units array
    const updatedUnits = units.filter((u) => u.number !== unitToDelete.number);
    
    // Remove the unit's corresponding lesson plans from localStorage
    localStorage.removeItem(`lessonPlans-${unitToDelete.number}`);
    
    // Remove the unit from uploadedUnits as well
    setUploadedUnits((prevState) => prevState.filter((unit) => unit !== unitToDelete.number));
    localStorage.setItem("uploadedUnits", JSON.stringify(uploadedUnits.filter((unit) => unit !== unitToDelete.number)));
    
    // Update the state with the updated units
    setUnits(updatedUnits);
    
    // Remove the deleted unit from localStorage
    localStorage.setItem("units", JSON.stringify(updatedUnits));
    
    // Show a snackbar to inform the user
    setSnackbar({ open: true, message: "Unit and corresponding lesson plans deleted successfully!", severity: "success" });
    
    // Close the delete confirmation dialog
    handleDeleteDialogClose();
  };
  
  

  return (
    <Box sx={{textAlign: 'center', padding: {xs: 2, sm: 3}, backgroundColor: '#f5f5f5', minHeight: 'calc(100vh - 60px)'}}>
      <Typography
        variant="h5"
        align="center"
        sx={{
          mb: 3,
          fontWeight: 600,
          color: "#2d3a56",
          fontSize: { xs: '1rem', sm: '2rem' }, // Responsive font size
        }}
      >
        Upload Learning Materials for <span style={{ color: "#673ab7" }}>{courseName} </span> 
         - <span style={{ color: "#673ab7" }}>{courseCode}</span>
      </Typography>

      {/* <div>
      <h1>Welcome, {user ? user.email : "Guest"}!</h1>
      <p>Your Role: {user?.role}</p>
      <p>Your ID: {user?.user_id}</p>
    </div> */}


      {units.length === 0 ? (
        <Box>
          {/* Deadline and Days Remaining */}
  <Box
  sx={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ede7f6',
    borderRadius: '12px',
    padding: { xs: '8px 16px', sm: '12px 20px' },
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    mb: 3,
  }}
>
  <CalendarMonthRounded
    sx={{
      fontSize: { xs: '1.5rem', sm: '2rem' },
      color: '#673ab7',
      mr: 1,
    }}
  />
  <Box sx={{display: 'flex', gap: '15px'}}>
  <Typography
  variant="body1"
  sx={{
    color: '#3f51b5',
    fontWeight: 600,
    fontSize: { xs: '1rem', sm: '1.2rem' },
  }}
>
  Deadline: {deadline} {/* en-GB ensures dd/mm/yyyy */}
</Typography>

    <Typography
      variant="body2"
      sx={{
        color: '#e91e63',
        fontWeight: 700,
        fontSize: { xs: '0.9rem', sm: '1rem' },
        mt: 0.5,
      }}
    >
      ({deadlineMessage})
    </Typography>
  </Box>
</Box>
          <img
            src={image}
            alt="No Units Created Yet"
            style={{ width: "150px", marginBottom: {xs: '10px', sm: '20px'}, opacity: 0.6, marginTop: {xs: '10px', sm: '30px'} }}
          />
          <Typography variant="h6" sx={{color: '#424242', fontSize: '24px', fontWeight: 'bold'}}>
            No Units Created Yet
          </Typography>
          <Typography variant="body1" sx={{color: '#757575', fontWeight: 'bold', mt: '20px', mb: '40px'}}>
            Click the "Add Unit" button below to create a new unit and start adding lesson plans. Let's get started!
          </Typography>
          <Button
                        variant="contained"
                        onClick={() => handleModalOpen()}
                        sx={{
                          px: 1.5,
                          py: 1,
                          fontWeight: 600,
                          fontSize: "1rem",
                          backgroundColor: "#ede7f6",
                          color: '#673ab7',
                          pr: 3,
                          borderRadius: '40px',
                          border: '2px solid #673ab7',
                          '&:hover': {
                            backgroundColor: "#673ab7",
                            color: '#fff',
                          },
                        }}
                      >
                        <Add sx={{ mr: 1 }} /> Add Unit
                      </Button>
                      <Typography sx={{color: 'red', fontWeight: 'bold', opacity: 0.3, mt: 4}}>
        Note : Units created will be only for your allocated subject and will be displayed to the students only after getting approval from Incharge faculty.
      </Typography>
        </Box>
      ) : (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '15px' }}>
            <Button
              variant="contained"
              onClick={() => handleModalOpen()}
              sx={{
                px: 1.5,
                py: 1,
                fontWeight: 'bold',
                textTransform: 'none',
                fontSize: {xs: '0.8rem', sm: '1rem'},
                backgroundColor: "#fff",
                color: '#673ab7',
                pr: 3,
                borderRadius: '40px',
                border: '2px solid #673ab7',
                '&:hover': {
                  backgroundColor: "#673ab7",
                  color: '#fff',
                },
              }}
            >
              <LibraryAddRounded sx={{ mr: 1 }} /> Add Unit
            </Button>
            {/* Deadline and Days Remaining */}
  <Box
  sx={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ede7f6',
    borderRadius: '12px',
    padding: { xs: '8px 16px', sm: '8px 20px' },
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  }}
>
  <CalendarMonthRounded
    sx={{
      fontSize: { xs: '1.5rem', sm: '2rem' },
      color: '#673ab7',
      mr: 1,
    }}
  />
  <Box sx={{display: 'flex', gap: '15px'}}>
  <Typography
  variant="body1"
  sx={{
    color: '#3f51b5',
    fontWeight: 600,
    fontSize: { xs: '1rem', sm: '1.2rem' },
  }}
>
  Deadline: {deadline} {/* en-GB ensures dd/mm/yyyy */}
</Typography>

    <Typography
      variant="body2"
      sx={{
        color: '#e91e63',
        fontWeight: 700,
        fontSize: { xs: '0.9rem', sm: '1rem' },
        mt: 0.5,
      }}
    >
      ({deadlineMessage})
    </Typography>
  </Box>
</Box>
          </Box>

          <Grid container spacing={2}>
  {units.map((unit) => {
    // Fetch the number of lesson plans for this unit from localStorage
    const lessonPlanCount = JSON.parse(localStorage.getItem(`lessonPlans-${unit.number}`))?.length || 0;

    return (
      <Grid item xs={12} sm={6} md={4} key={unit.number} mt={0}>
        <UnitCard
            unit={unit}
            handleUploadClick={handleUploadClick}
            uploadedUnits={uploadedUnits}
            handleDetailsModalOpen={handleDetailsModalOpen}
            handleModalOpen={handleModalOpen}
            handleDeleteDialogOpen={handleDeleteDialogOpen}
            navigate={navigate}  // Pass navigate as a prop
            lessonPlanCount={lessonPlanCount}
          />
      </Grid>
    );
  })}
  <Typography sx={{color: 'red', fontWeight: 'bold', opacity: 0.3, mt: 4, pl: {xs: 2, sm: 3}, pb: {xs: 2, sm: 3}, pr: {xs: 2, sm: 3}, textAlign: 'left' }}>
        Note : Units created will be only for your allocated subject and will be displayed to the students only after getting approval from Incharge faculty.
      </Typography>
</Grid>

        </>
      )}

       {/* Unit Details Modal */}
       <UnitDetailsModal
        open={detailsModalOpen}
        handleClose={handleDetailsModalClose}
        unitDetails={unitDetails}
      />

      {/* Unit Modal */}
      <UnitModal
        modalOpen={modalOpen}
        handleModalClose={handleModalClose}
        isEdit={isEdit}
        currentUnit={currentUnit}
        setCurrentUnit={setCurrentUnit}
        unitError={unitError}
        setUnitError={setUnitError}
        snackbar={snackbar}
        handleOpenConfirmation={handleOpenConfirmation}
      />

{/* Confirmation Modal */}
{/* Confirmation Modal */}
<Dialog
  open={isConfirmationOpen}
  onClose={handleCloseConfirmation}
  aria-labelledby="confirmation-dialog-title"
  aria-describedby="confirmation-dialog-description"
  fullWidth // Makes the modal automatically adapt to smaller screens
  sx={{
    "& .MuiDialog-paper": {
      width: { xs: "90%", sm: "500px" }, // Dynamically adjusts width based on screen size
      maxWidth: "none", // Override Material-UI's default maxWidth constraint
      borderRadius: "12px", // Adds a rounded corner for better UI
    },
  }}
>
  <DialogTitle
    id="confirmation-dialog-title"
    sx={{
      color: "#673ab7",
      fontWeight: "bold",
      fontSize: { xs: "18px", sm: "22px" }, // Font size adjusts for different screen sizes
      textAlign: "center",
    }}
  >
    {confirmationAction === "edit" ? "Edit this Unit!" : "Create this Unit!"}
  </DialogTitle>
  <DialogContent
    sx={{
      px: 2, // Padding adjusts for screen size
    }}
  >
    <Typography
      sx={{
        color: "#757575",
        fontWeight: "bold",
        fontSize: { xs: "14px", sm: "16px" }, // Font size adjusts based on screen size
        lineHeight: "1.5", // Ensures proper spacing between lines
      }}
    >
      {confirmationAction === "edit"
        ? "Are you sure you want to save the changes to this unit? The changes will be sent to the Incharge for getting approval."
        : "Are you sure you want to create this new unit? This Unit will be sent to Incharge for getting approval."}
    </Typography>
  </DialogContent>
  <DialogActions
    sx={{
      px: { xs: 2, sm: 4 }, // Adjust padding for responsiveness
    }}
  >
    <Button
      onClick={handleCloseConfirmation}
      sx={{
        color: "#757575",
        textTransform: "none",
        fontWeight: "bold",
        fontSize: { xs: "14px", sm: "16px" },
        "&:hover": { color: "red" },
      }}
    >
      Cancel
    </Button>
    <Button
      onClick={handleConfirmAction}
      sx={{
        color: "#673ab7",
        fontWeight: "bold",
        textTransform: "none",
        fontSize: { xs: "14px", sm: "16px" },
        backgroundColor: "#fff",
        border: "2px solid #673ab7",
        "&:hover": {
          backgroundColor: "#673ab7",
          color: "#fff",
        },
      }}
    >
      Confirm
    </Button>
  </DialogActions>
</Dialog>



<Modal open={uploadModalOpen} onClose={() => setUploadModalOpen(false)}>
  <Box
    sx={{
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      width: {xs: '95%', sm: '500px'},
      bgcolor: "background.paper",
      boxShadow: 24,
      p: {xs: 3, sm: 2},
      borderRadius: 2,
    }}
  >
    <Typography variant="h6" sx={{color: '#673ab7', fontWeight: 'bold', mb: 2, textAlign: 'center' }}>
      Confirm Upload
    </Typography>
    <Typography variant="body1" sx={{color: '#757575', fontWeight: 'bold', mb: 3 }}>
      Are you sure you want to upload all lesson plans for Unit{" "}
      <strong>{selectedUnit?.number || "N/A"}</strong> for approval?
    </Typography>
    <Box display="flex" sx={{justifyContent: 'flex-end'}}>
      <Button
        onClick={() => setUploadModalOpen(false)}
        sx={{color: '#757575', textTransform: 'none', fontWeight: 'bold', '&:hover' : {color: 'red'}}}
      >
        Cancel
      </Button>
      <Button
        onClick={handleUploadConfirm}
        sx={{color: '#673ab7', 
          fontWeight: 'bold',
          textTransform: 'none',
          backgroundColor: '#fff',
          border: '2px solid #673ab7',
          '&:hover' : {
            backgroundColor: '#673ab7',
            color: '#fff',
          }
          }}
      >
        Upload
      </Button>
    </Box>
  </Box>
</Modal>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleDeleteDialogClose}>
        <DialogTitle sx={{color: '#673ab7', fontWeight: 'bold', }}>Delete Unit !</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{color: '#757575', fontWeight: 'bold'}}>
            Are you sure you want to delete Unit {unitToDelete?. number} ? All associated lesson plans will also be deleted.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{mr: '20px', mb: '10px'}}>
          <Button onClick={handleDeleteDialogClose} sx={{textTransform: 'none', fontWeight: 'bold', color: '#616161'}}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleDeleteUnit}
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

export default Upload;
