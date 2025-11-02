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
import { Edit, Delete, Add, AutoDeleteRounded, LibraryAddRounded, ScheduleSendRounded, UploadFile, CloudUploadRounded, InfoRounded } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import image from '../../../assets/images/empty_state_icon.png';
import UnitInfo from "../../../components/DownloadPDF/UnitInfo";

function Upload() {
  const [units, setUnits] = useState([]); // List of units
  const [modalOpen, setModalOpen] = useState(false); // Modal state
  const [currentUnit, setCurrentUnit] = useState({ number: "", name: "" }); // Current unit being edited/created
  const [isEdit, setIsEdit] = useState(false); // Edit mode
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false); // Delete confirmation dialog
  const [unitToDelete, setUnitToDelete] = useState(null); // Unit to be deleted
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const courseName = "Strength of Materials"; // Static course name
  const courseCode = "22ME402";
  const [unitError, setUnitError] = useState({ number: false, name: false });
  const navigate = useNavigate();

  const [uploadModalOpen, setUploadModalOpen] = useState(false);
const [selectedUnit, setSelectedUnit] = useState(null);
const [uploadedUnits, setUploadedUnits] = useState([]);
const [detailsModalOpen, setDetailsModalOpen] = useState(false);
const [unitDetails, setUnitDetails] = useState(null);
const [isConfirmationOpen, setIsConfirmationOpen] = useState(false); // State to track modal visibility
  const [confirmationAction, setConfirmationAction] = useState(""); // To track action type (add/edit)

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
 const handleUploadConfirm = () => {
  if (selectedUnit) {
    const updatedUploadedUnits = [...uploadedUnits, selectedUnit.number];
    setUploadedUnits(updatedUploadedUnits);

    // Update localStorage
    localStorage.setItem("uploadedUnits", JSON.stringify(updatedUploadedUnits));
    localStorage.setItem(`hasChanges-${selectedUnit.number}`, "false"); // Reset change flag

    setUploadModalOpen(false);
    setSnackbar({
      open: true,
      message: `Unit ${selectedUnit.number} and corresponding lesson plans uploaded successfully!`,
      severity: "success",
    });
  }
};


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

      {units.length === 0 ? (
        <Box>
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
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
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
            {/* <Button
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
              <ScheduleSendRounded sx={{ mr: 1 }} /> Upload Units
            </Button> */}
          </div>

          <Grid container spacing={2}>
  {units.map((unit) => {
    // Fetch the number of lesson plans for this unit from localStorage
    const lessonPlanCount = JSON.parse(localStorage.getItem(`lessonPlans-${unit.number}`))?.length || 0;

    return (
      <Grid item xs={12} sm={6} md={4} key={unit.number} mt={2}>
        <Card
          sx={{
            borderRadius: "12px",
            transition: "transform 0.3s, box-shadow 0.3s",
            ":hover": {
              transform: "scale(1.03)",
              boxShadow: "0 8px 20px rgba(0, 0, 0, 0.15)",
            },
            height: "100%", // Ensures consistent height
          }}
        >
          <CardContent
            sx={{
              background: 'linear-gradient(135deg,rgb(245, 242, 249),rgb(245, 243, 247),rgb(242, 240, 247),rgb(247, 245, 251))',
              borderRadius: "12px",
              border: '1px solid #673ab7',
              boxShadow: "0 4px 10px rgba(0, 0, 0, 0.1)",
              padding: { xs: "1rem", sm: "1.5rem" },
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              height: "100%", // Ensures consistent height for content
            }}
          >
            {/* Unit number and status */}
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Typography
                variant="subtitle1"
                fontWeight="bold"
                sx={{
                  fontSize: "1.3rem",
                  color: "#757575",
                }}
              >
                Unit {unit.number}
              </Typography>
              <div style={{ display: 'flex', gap: '0px', alignItems: 'center' }}>
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center', // Centering content horizontally and vertically
      backgroundColor:
        unit.status === "Approved"
          ? "#1b5e20"
          : unit.status === "Pending"
          ? "#f57f17"
          : "#b71c1c",
      borderRadius: "30px",
      padding: "5px 14px",
      color: "#fff",
      fontSize: "0.8rem",
      fontWeight: "bold",
      textTransform: "none",
    }}
  >
    {unit.status}
  </Box>
  <Button
  onClick={() => handleUploadClick(unit)}
  disabled={uploadedUnits.includes(unit.number) && localStorage.getItem(`hasChanges-${unit.number}`) !== "true"}
  sx={{
    ml: 1,
    fontSize: "0.8rem",
    fontWeight: "bold",
    textTransform: "none",
    backgroundColor: uploadedUnits.includes(unit.number) && localStorage.getItem(`hasChanges-${unit.number}`) !== "true" ? "#ccc" : "#673ab7",
    borderRadius: "6px",
    padding: "5px 10px",
    color: uploadedUnits.includes(unit.number) && localStorage.getItem(`hasChanges-${unit.number}`) !== "true" ? "#000" : "#fff",
    "&:hover": {
      backgroundColor: uploadedUnits.includes(unit.number) && localStorage.getItem(`hasChanges-${unit.number}`) !== "true" ? "#ccc" : "#512da8",
    },
  }}
>
  <CloudUploadRounded sx={{ mr: 1 }} />
  {uploadedUnits.includes(unit.number) && localStorage.getItem(`hasChanges-${unit.number}`) !== "true"
    ? "Uploaded"
    : "Upload"}
</Button>

</div>

              
            </Box>

            {/* Unit name */}
            <Typography
              variant="h6"
              fontWeight="bold"
              color="#673ab7"
              sx={{
                fontWeight: 900,
                whiteSpace: "normal", // Allows the text to wrap into multiple lines
                overflow: "hidden",
                maxWidth: "100%",
                textAlign: 'left',
                color: "#673ab7",
                textOverflow: "ellipsis",
                fontSize: {xs: '1.1rem', sm: '1.2rem'},
                mt: "20px",
                wordWrap: "break-word",
                overflowWrap: "break-word",
                display: "block",
                height: "60px", // Set a fixed height for the unit name area to maintain consistent height across cards
                lineHeight: "1.5rem", // Adjust line height to make sure text wraps well
              }}
            >
              {unit.name}
            </Typography>

            {/* Number of lesson plans */}
            <Typography variant="body2" sx={{
            mt: 2,
            color: "#616161",
            fontWeight: 600,
            textAlign: 'left',
            fontSize: '1rem',
          }}>
              {lessonPlanCount > 0
                ? `${lessonPlanCount} Lesson Plan${lessonPlanCount > 1 ? "s" : ""} in this Unit`
                : "No Lesson Plans have been added yet"}
            </Typography>

            {/* Last updated */}
            <Typography
  variant="body2"
  color="text.secondary"
  sx={{
    mt: 1,
    mb: 0,
    fontWeight: "bold",
    textAlign: "left",
    color: "#757575",
  }}
>
  
  Created:{" "}
  {unit.created
    ? new Date(unit.created).toLocaleString() // Display the created date
    : "N/A"}
    <br />
  Last updated:{" "}
  {unit.lastUpdated
    ? new Date(unit.lastUpdated).toLocaleString() // Convert ISO string to readable format
    : "N/A"}
</Typography>


            {/* View Lesson Plan button and action icons */}
            <Box mt={2} display="flex" justifyContent="space-between" alignItems="center">
              <Button
                variant="outlined"
                onClick={() => 
                  navigate(`/lesson-plan/${unit.number}`, {
                    state: { unitName: unit.name } // Passing the unit name along with unit number
                  })
                }                
                sx={{
                  fontWeight: "bold",
                  textTransform: "none",
                  color: "#673ab7",
                  fontSize: {xs: '14px', sm: '16px'},
                  border: "1px solid #673ab7",
                  borderRadius: "8px",
                  padding: {xs: '5px 10px', sm: '6px 16px'},
                  backgroundColor: '#fff',
                  "&:hover": {
                    backgroundColor: "#673ab7",
                    color: "#fff",
                  },
                }}
              >
                View Lesson Plan
              </Button>
              <Box sx={{display: 'flex'}}>
                {/* New Icon Button for Details */}
  <IconButton
    color="primary"
    onClick={() => handleDetailsModalOpen(unit)}
    sx={{
      color: '#673ab7',
      ml: 2,
      zIndex: 1,
      border: '2px solid #673ab7',
      backgroundColor: '#fff',
      '&:hover': { backgroundColor: '#673ab7', color: '#fff' }
    }}
  >
    <InfoRounded />
  </IconButton>
                <IconButton
                  color="primary"
                  onClick={() => handleModalOpen(unit)}
                  sx={{ color: '#673ab7', zIndex: 1, ml: {xs: '5px', sm: '10px'}, fontSize: {xs: '0.6rem', sm: '1rem'},border: '2px solid #673ab7', backgroundColor: '#fff', '&:hover': {backgroundColor: '#673ab7', color: '#fff'} }}
                >
                  <Edit />
                </IconButton>
                <IconButton
                  color="error"
                  onClick={() => handleDeleteDialogOpen(unit)}
                  sx={{ color: '#b71c1c', ml: {xs: '5px', sm: '10px'}, zIndex: 1, border: '2px solid #b71c1c', backgroundColor: '#fff', '&:hover': {backgroundColor: '#b71c1c', color: '#fff'} }}
                >
                  <AutoDeleteRounded />
                </IconButton>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>
    );
  })}
  <Typography sx={{color: 'red', fontWeight: 'bold', opacity: 0.3, mt: 4, pl: {xs: 2, sm: 3}, pb: {xs: 2, sm: 3}, pr: {xs: 2, sm: 3}, textAlign: 'left' }}>
        Note : Units created will be only for your allocated subject and will be displayed to the students only after getting approval from Incharge faculty.
      </Typography>
</Grid>

        </>
      )}

<Modal
  open={detailsModalOpen}
  onClose={handleDetailsModalClose}
  aria-labelledby="unit-details-modal-title"
  aria-describedby="unit-details-modal-description"
>
  <Box
    sx={{
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      width: { xs: "95%", sm: "80%", md: "80%" },
      height: "90%",
      bgcolor: "background.paper",
      boxShadow: 24,
      borderRadius: "12px",
      display: "flex",
      flexDirection: "column",
      p: {xs: 0, sm: 2},
      overflow: "hidden", // Hides the scrollbar for the modal
    }}
  >
    {/* Header: Unit Number and Name */}
    <Box
      sx={{
        position: "sticky",
        top: 0,
        zIndex: 10,
        bgcolor: "background.paper",
        p: 2,
        fontWeight: 'bold',
        borderBottom: "1px solid #e0e0e0",
        display: "flex",
        justifyContent: "center",
      }}
    >
      <Typography
        id="unit-details-modal-title"
        variant="h5"
        fontWeight="bold"
        textAlign="center"
        color="#673ab7"
      >
        Unit {unitDetails?.number || "N/A"} - {unitDetails?.name || "N/A"}
      </Typography>
    </Box>

    {/* Scrollable Content */}
    <Box
      sx={{
        flex: 1,
        overflowY: "scroll", // Enables scrolling for content
        p: 2,
        display: "flex",
        flexDirection: "column",
        gap: 3,
        maxHeight: "70vh", // Ensures the content section is scrollable within modal
        '&::-webkit-scrollbar': {
          display: 'none', // Hides the scrollbar for webkit browsers (e.g., Chrome, Safari)
        },
      }}
    >

      {/* Lesson Plans */}
      <Box sx={{ border: "1px solid #e0e0e0", borderRadius: 2, p: 2, bgcolor: "#f9f9f9" }}>
        <Typography variant="h6" color="#673ab7" fontWeight="bold" mb={1}>
          1. No. of Lesson Plans
        </Typography>
        <Typography variant="body1">{unitDetails?.lessonPlanCount || 0}</Typography>
      </Box>

      {/* Last Updated */}
      {/* Created At and Last Updated */}
<Box
  sx={{
    border: "1px solid #e0e0e0",
    borderRadius: 2,
    p: 2,
    bgcolor: "#f9f9f9",
  }}
>
  <Typography variant="h6" color="#673ab7" fontWeight="bold" mb={1}>
    2. Timestamps
  </Typography>
  <Typography variant="body1" sx={{ mb: 1, color: '#757575' }}>
    <strong>Created At:</strong>{" "}
    {unitDetails?.created
      ? new Date(unitDetails.created).toLocaleString() // Format Created At
      : "N/A"}
  </Typography>
  <Typography variant="body1" sx={{ mb: 1, color: '#757575' }}>
    <strong>Last Updated:</strong>{" "}
    {unitDetails?.lastUpdated
      ? new Date(unitDetails.lastUpdated).toLocaleString() // Format Last Updated
      : "N/A"}
  </Typography>
</Box>


      {/* Introduction */}
      <Box sx={{ border: "1px solid #e0e0e0", borderRadius: 2, p: 2, bgcolor: "#f9f9f9" }}>
        <Typography variant="h6" color="#673ab7" fontWeight="bold" mb={1}>
          3. Introduction
        </Typography>
        <Typography variant="body1" sx={{ whiteSpace: "pre-wrap", wordWrap: "break-word" }}>
          {unitDetails?.introduction || "N/A"}
        </Typography>
      </Box>

      {/* Summary */}
      <Box sx={{ border: "1px solid #e0e0e0", borderRadius: 2, p: 2, bgcolor: "#f9f9f9" }}>
        <Typography variant="h6" color="#673ab7" fontWeight="bold" mb={1}>
          4. Summary
        </Typography>
        <Typography variant="body1" sx={{ whiteSpace: "pre-wrap", wordWrap: "break-word" }}>
          {unitDetails?.summary || "N/A"}
        </Typography>
      </Box>

      {/* Objectives */}
      <Box sx={{ border: "1px solid #e0e0e0", borderRadius: 2, p: 2, bgcolor: "#f9f9f9" }}>
        <Typography variant="h6" color="#673ab7" fontWeight="bold" mb={1}>
          5. Objectives
        </Typography>
        <Typography variant="body1" sx={{ whiteSpace: "pre-wrap", wordWrap: "break-word" }}>
          {unitDetails?.objectives || "N/A"}
        </Typography>
      </Box>

      {/* Outcomes */}
      <Box sx={{ border: "1px solid #e0e0e0", borderRadius: 2, p: 2, bgcolor: "#f9f9f9" }}>
        <Typography variant="h6" color="#673ab7" fontWeight="bold" mb={1}>
          6. Outcomes
        </Typography>
        <Typography variant="body1" sx={{ whiteSpace: "pre-wrap", wordWrap: "break-word" }}>
          {unitDetails?.outcomes || "N/A"}
        </Typography>
      </Box>

      {/* Mind Map Display */}
      {/* <Box sx={{ border: "1px solid #e0e0e0", borderRadius: 2, p: 2, bgcolor: "#f9f9f9", mt: 2 }}>
        <Typography variant="h6" color="#673ab7" fontWeight="bold" mb={1}>
          7. Mind Map
        </Typography>
        {currentUnit?.mindMap ? (
  currentUnit.mindMap.type?.includes("image/") ? (
    <img
      src={currentUnit.mindMap.content} // Use base64 content here
      alt={currentUnit.mindMap.name}
      style={{
        maxWidth: "100%",
        maxHeight: "300px",
        objectFit: "contain",
        borderRadius: "8px",
      }}
    />
  ) : currentUnit.mindMap.type?.includes("pdf") ? (
    <a
      href={currentUnit.mindMap.content} // Use base64 content here
      target="_blank"
      rel="noopener noreferrer"
      style={{ color: "#673ab7", textDecoration: "none" }}
    >
      View Mind Map (PDF)
    </a>
  ) : (
    "Unsupported file type"
  )
) : (
  "No file uploaded"
)}


      </Box> */}

      {/* References */}
      <Box sx={{ border: "1px solid #e0e0e0", borderRadius: 2, p: 2, bgcolor: "#f9f9f9" }}>
        <Typography variant="h6" color="#673ab7" fontWeight="bold" mb={1}>
          7. References
        </Typography>
        <Typography variant="body1" sx={{ whiteSpace: "pre-wrap", wordWrap: "break-word" }}>
          {unitDetails?.references || "N/A"}
        </Typography>
      </Box>
    </Box>

    {/* Fixed Close Button */}
    <Box
      sx={{
        bottom: 0,
        zIndex: 10,
        bgcolor: "background.paper",
        p: 0,
        borderTop: "1px solid #e0e0e0",
        display: "flex",
        justifyContent: "flex-end",
      }}
    >
      {/* <UnitInfo unitDetails={unitDetails} /> */}
      <Button
        variant="contained"
        onClick={handleDetailsModalClose}
        sx={{
          textTransform: "none",
          fontWeight: 'bold',
          mr: 2,
          mt: 2,
          backgroundColor: "#673ab7",
          "&:hover": { backgroundColor: "#512da8" },
        }}
      >
        Close
      </Button>
    </Box>
  </Box>
</Modal>

      {/* Modal for Adding/Editing Unit */}
      <Modal open={modalOpen} onClose={handleModalClose}>
  <Box
    bgcolor="background.paper"
    borderRadius={2}
    boxShadow={24}
    position="absolute"
    top="50%"
    left="50%"
    sx={{
      transform: "translate(-50%, -50%)",
      padding: 0,
      width: { xs: "95%", sm: "90%", md: "70%", lg: "60%" },
      maxWidth: "600px",
      display: "flex",
      flexDirection: "column",
      maxHeight: "90vh",
    }}
  >
    {/* Header */}
    <Box
      sx={{
        color: "#673ab7",
        padding: 2,
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
      }}
    >
      <Typography
        variant="h6"
        sx={{
          fontWeight: "bold",
          textAlign: "center",
          fontSize: { xs: "1.2rem", sm: "1.4rem" },
        }}
      >
        {isEdit ? "Edit Unit" : "Add Unit"}
      </Typography>
    </Box>

    {/* Scrollable Content */}
    <Box
      sx={{
        flex: 1,
        padding: 3,
        paddingTop: 0,
        overflowY: "auto",
        "&::-webkit-scrollbar": { display: "none" }, // Hide scrollbar
        msOverflowStyle: "none", // For Internet Explorer and Edge
        scrollbarWidth: "none", // For Firefox
      }}
    >
      {/* Unit Number and Name */}
      <Box display="flex" flexDirection={{ xs: "column", sm: "row" }} gap={2} sx={{ mb: 3 }}>
        <FormControl fullWidth>
          <InputLabel
            sx={{
              color: "#616161",
              fontWeight: "bold",
              backgroundColor: "white",
              padding: "0 5px",
            }}
          >
            Unit Number
          </InputLabel>
          <Select
            value={currentUnit.number}
            onChange={(e) => setCurrentUnit({ ...currentUnit, number: e.target.value })}
          >
            {[...Array(10).keys()].map((n) => (
              <MenuItem key={n + 1} value={n + 1}>
                {n + 1}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          label="Unit Name"
          value={currentUnit.name}
          onChange={(e) => setCurrentUnit({ ...currentUnit, name: e.target.value })}
          fullWidth
          sx={{
            "& .MuiInputLabel-root": {
              color: "#616161",
              fontWeight: "bold",
            },
          }}
          error={unitError.name}
          helperText={unitError.name ? "Unit Name is required." : ""}
        />
      </Box>

      {/* Introduction */}
      <TextField
        label="Introduction"
        multiline
        rows={4}
        value={currentUnit.introduction}
        onChange={(e) => setCurrentUnit({ ...currentUnit, introduction: e.target.value })}
        fullWidth
        sx={{ mb: 2 }}
      />

      {/* Summary */}
      <TextField
        label="Summary"
        multiline
        rows={4}
        value={currentUnit.summary}
        onChange={(e) => setCurrentUnit({ ...currentUnit, summary: e.target.value })}
        fullWidth
        sx={{ mb: 2 }}
      />

      {/* Mind Map (File Upload) */}
      {/* <Box
  display="flex"
  flexDirection={{ xs: "column", sm: "row" }}
  alignItems="center"
  gap={2}
  sx={{ mb: 2 }}
>
  <Button
    variant="outlined"
    component="label"
    sx={{
      borderColor: "#673ab7",
      color: "#673ab7",
      textTransform: "none",
      fontWeight: "bold",
      "&:hover": {
        backgroundColor: "#673ab7",
        color: "#fff",
      },
    }}
  >
    Upload Mind Map
    <input
      hidden
      type="file"
      accept=".png, .jpg, .jpeg, .pdf"
      onChange={(e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
            const mindMapData = {
              fileName: file.name,
              base64: reader.result,
              type: file.type,
            };

            // Update currentUnit's mindMap
            setCurrentUnit({
              ...currentUnit,
              mindMap: mindMapData,
            });

            localStorage.setItem("mindMap", JSON.stringify(mindMapData));
          };
          reader.readAsDataURL(file);
        }
      }}
    />
  </Button>
  <Typography variant="body2" sx={{ color: "#616161" }}>
    {currentUnit.mindMap
      ? currentUnit.mindMap.type?.includes("image/")
        ? "Mind Map Image Uploaded"
        : currentUnit.mindMap.type?.includes("pdf")
        ? "Mind Map PDF Uploaded"
        : "Unsupported file type"
      : "No file uploaded"}
  </Typography>
</Box>

{currentUnit.mindMap ? (
  currentUnit.mindMap.type?.includes("image/") ? (
    <img
      src={currentUnit.mindMap.base64} // Use the base64 content directly
      alt={currentUnit.mindMap.fileName}
      style={{
        maxWidth: "100%",
        maxHeight: "300px",
        objectFit: "contain",
        borderRadius: "8px",
      }}
    />
  ) : currentUnit.mindMap.type?.includes("pdf") ? (
    <a
      href={currentUnit.mindMap.base64} // Use base64 content here as the PDF link
      target="_blank"
      rel="noopener noreferrer"
      style={{ color: "#673ab7", textDecoration: "none" }}
    >
      View Mind Map (PDF)
    </a>
  ) : (
    "Unsupported file type"
  )
) : (
  <Typography>No mind map uploaded</Typography>
)} */}

      {/* References */}
      <TextField
        label="References"
        multiline
        rows={3}
        value={currentUnit.references}
        onChange={(e) => setCurrentUnit({ ...currentUnit, references: e.target.value })}
        fullWidth
        sx={{ mb: 2 }}
      />

      {/* Objectives and Outcomes */}
      <Box display="flex" flexDirection="column" gap={2} sx={{ mb: 2 }}>
        <TextField
          label="Objectives"
          multiline
          rows={3}
          value={currentUnit.objectives}
          onChange={(e) => setCurrentUnit({ ...currentUnit, objectives: e.target.value })}
          fullWidth
        />
        <TextField
          label="Outcomes"
          multiline
          rows={3}
          value={currentUnit.outcomes}
          onChange={(e) => setCurrentUnit({ ...currentUnit, outcomes: e.target.value })}
          fullWidth
        />
      </Box>
    </Box>

    {/* Footer */}
    <Box
      sx={{
        padding: 2,
        borderTop: "1px solid #e0e0e0",
        display: "flex",
        justifyContent: "flex-end",
        gap: 2,
      }}
    >
      <Button
        onClick={handleModalClose}
        sx={{
          color: "#616161",
          textTransform: "none",
          fontWeight: "bold",
          "&:hover": {
            color: "red",
          },
        }}
      >
        Cancel
      </Button>
      {/* Save Button */}
      <Button
        variant="contained"
        onClick={() => {
          const errors = {
            number: !currentUnit.number,
            name: !currentUnit.name,
          };

          if (errors.number || errors.name) {
            setUnitError(errors);
            showSnackbar("Please fill in required fields.");
          } else {
            setUnitError({ number: false, name: false });
            handleOpenConfirmation(isEdit ? "edit" : "add"); // Open confirmation modal
          }
        }}
        sx={{
          backgroundColor: "#673ab7",
          color: "#fff",
          textTransform: "none",
          fontWeight: "bold",
          "&:hover": {
            backgroundColor: "#512da8",
          },
        }}
      >
        {isEdit ? "Save Changes" : "Save Unit"}
      </Button>

    </Box>
  </Box>
</Modal>

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
