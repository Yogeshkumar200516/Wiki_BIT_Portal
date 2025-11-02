import React, { useState, useEffect } from "react";
import axios from 'axios';
import {
  Box,
  Typography,
  Grid,
  Button,
  Modal,
  TextField,
  Autocomplete,
  Checkbox,
  Snackbar,
  Alert,
  FormControl,
  FormControlLabel,
  MenuItem,
  Select,
  InputLabel,
  Switch,
  Stack,
  FormGroup
} from "@mui/material";
import AssignedFacultiesTable from "./FacultyList";
import image from '../../../assets/images/empty_state_icon.png';
import { Assignment, LibraryAddRounded } from "@mui/icons-material";
import { styled } from '@mui/material/styles';

const FacultyAssign = () => {
  // States
  const [courses, setCourses] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [filteredCourses, setFilteredCourses] = useState(courses);
  const [filteredFaculties, setFilteredFaculties] = useState(faculties);
  const [inchargeFaculty, setInchargeFaculty] = useState(null);
  const [creatingFaculties, setCreatingFaculties] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
  const [disableFilter, setDisableFilter] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [assignments, setAssignments] = useState([0])

  const [departmentFilter, setDepartmentFilter] = useState("");
  const [semesterFilter, setSemesterFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [deadline, setDeadline] = useState(""); // Initialize the deadline state
  const currentDate = new Date().toISOString().split('T')[0];

  const [isEditMode, setIsEditMode] = useState(false);
  const [currentAssignment, setCurrentAssignment] = useState(null);
  const [editConfirmationModalOpen, setEditConfirmationModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [count,setCount]=useState([0])
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


useEffect(()=>{
  const fetchData1 = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/admin/faculty-courses");
      const datacount = await response.json();
      setCount(datacount.data.length)
      fetchData1();
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  fetchData1();
}),[assignments,count]


  // Update faculties when a course is selected
useEffect(() => {
  if (selectedCourse) {
    const filtered = faculties.filter(
      (faculty) => faculty.department_code === selectedCourse.department_code
    );
    setFilteredFaculties(filtered);
  } else {
    setFilteredFaculties(faculties); // Show all faculties when no course is selected
  }
}, [selectedCourse, faculties]);

  // Fetch data on mount
useEffect(() => {
  const fetchData = async () => {
    try {
      const [coursesRes, facultiesRes] = await Promise.all([
        fetch("http://localhost:5000/api/admin/courses"),
        fetch("http://localhost:5000/api/admin/faculties"),
      ]);

      if (!coursesRes.ok || !facultiesRes.ok) {
        throw new Error("Failed to fetch data");
      }

      const coursesData = await coursesRes.json();
      const facultiesData = await facultiesRes.json();

      setCourses(coursesData.data);
      setFaculties(facultiesData.data.filter((f) => f.role === "Faculty"));
      setFilteredCourses(coursesData.data); // Initialize filteredCourses
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, []);

// Apply filters when department, semester, or year changes
useEffect(() => {
  filterCourses();
}, [departmentFilter, semesterFilter, yearFilter]);

const filterCourses = () => {
  let filtered = [...courses]; // Make a shallow copy of courses to avoid mutating the original array
  if (departmentFilter) {
    filtered = filtered.filter((course) => course.department_code === departmentFilter);
  }
  if (semesterFilter) {
    filtered = filtered.filter((course) => course.semester === semesterFilter); // Ensure semesterFilter is compared as string if needed
  }

  if (yearFilter === "2024-2025") {
    filtered = [...filtered];
  }
  setFilteredCourses(filtered);
};

// Handle Course Change
const handleCourseChange = (event, value) => {
  setSelectedCourse(value);
  if (value && !disableFilter) {
    setFilteredFaculties(faculties.filter((faculty) => faculty.department === value.department));
  } else {
    setFilteredFaculties(faculties);
  }
};

// Handle Faculty Selection
const handleInchargeChange = (event, value) => {
  setInchargeFaculty(value);
};

const handleCreatingFacultiesChange = (event, value) => {
  const duplicates = new Set();
  const hasDuplicates = value.some((faculty) => {
    if (duplicates.has(faculty.id)) return true;
    duplicates.add(faculty.id);
    return false;
  });

  if (hasDuplicates) {
    setSnackbarMessage("Duplicate faculty selected.");
    setSnackbarSeverity("error");
    setSnackbarOpen(true);
  } else {
    setCreatingFaculties(value);
  }
};

// Toggle Filter
const handleFilterToggle = () => {
  setDisableFilter((prev) => !prev);
  if (selectedCourse && disableFilter) {
    setFilteredFaculties(faculties.filter((faculty) => faculty.department === selectedCourse.department));
  } else {
    setFilteredFaculties(faculties);
    setSnackbarMessage("Filter disabled. Showing all faculties.");
    setSnackbarSeverity("info");
    setSnackbarOpen(true);
  }
};

// Handle Submit
const handleSubmit = () => {
  if (selectedCourse && inchargeFaculty && deadline && creatingFaculties.length > 0) {
    isEditMode ? setEditConfirmationModalOpen(true) : setConfirmationModalOpen(true);
  } else {
    setSnackbarMessage("Please select a Course, an Incharge Faculty, at least one creating faculty, and set a deadline.");
    setSnackbarSeverity("error");
    setSnackbarOpen(true);
  }
};

// Confirm Edit
const handleEditConfirmSubmit = async () => {
  const updatedAssignment = {
    assignmentId: currentAssignment.id,  // The ID of the assignment being updated
    courseMappingId: selectedCourse.course_id,  // The ID of the selected course
    inchargeId: inchargeFaculty.user_id,  // The in-charge faculty ID
    creatingFaculties: creatingFaculties.map((faculty) => faculty.user_id),  // List of faculty IDs
    deadline: deadline,  // The updated deadline
  };

  console.log("Sending Updated Data:", updatedAssignment);  // Log the data to ensure it's correct

  try {
    const response = await fetch("http://localhost:5000/api/admin/update-assignment", {
      method: "PUT",  // Use PUT for updating data
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedAssignment),  // Send the updated data in the request body
    });

    if (!response.ok) {
      throw new Error("Failed to update assignment");
    }

    // If the update is successful, update the local state to reflect changes
    setAssignments(assignments.map((assignment) =>
      assignment.id === currentAssignment.id ? { ...assignment, ...updatedAssignment } : assignment
    ));

    setSnackbarMessage("Assignment updated successfully.");
    setSnackbarSeverity("success");
    setSnackbarOpen(true);
    setEditConfirmationModalOpen(false);
    setModalOpen(false);
  } catch (error) {
    setSnackbarMessage("Error updating assignment.");
    setSnackbarSeverity("error");
    setSnackbarOpen(true);
  } finally {
    setLoading(false); // Set loading to false after the fetch is done
  }
};

// Confirm New Assignment
const handleConfirmSubmit = async () => {
  const newAssignment = {
    courseMappingId: selectedCourse?.course_id,   // The ID of the selected course
    inchargeId: inchargeFaculty?.user_id,  // The in-charge faculty ID (e.g., 'ME10101')
    creatingFaculties: creatingFaculties.map(faculty => faculty.user_id),  // List of wetting faculties (array of IDs like ['ME10201', 'ME10301'])
    deadline: deadline,  // The deadline date for the assignment
  };

  console.log("Sending Request Data:", newAssignment);  // Log the data to ensure it's correct

  try {
    const response = await fetch("http://localhost:5000/api/admin/assign-faculty", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newAssignment),
    });

    if (!response.ok) {
      throw new Error("Failed to save assignment");
    }

    setSnackbarMessage("Faculty assignment successful!");
    setSnackbarSeverity("success");
    setSnackbarOpen(true);
    setConfirmationModalOpen(false);
    setModalOpen(false);
  } catch (error) {
    setSnackbarMessage("Error saving assignment.");
    setSnackbarSeverity("error");
    setSnackbarOpen(true);
  } finally {
    setLoading(false); // Set loading to false after the fetch is done
  }
};

// Handle Delete
const handleDelete = async (assignmentId) => {
  try {
    const response = await axios.delete(`http://localhost:5000/api/admin/delete-assignment/:${assignmentId}`);
    if (response.status === 200) {
      console.log("Assignment deleted successfully.");
      // Update the UI or handle success here
    } else {
      console.error("Failed to delete assignment.");
    }
  } catch (error) {
    console.error("Error occurred during deletion:", error);
  } finally {
    setLoading(false); // Set loading to false after the fetch is done
  }
};

// Handle Edit
const handleEdit = (assignment) => {
  if (!assignment) return; // Ensure assignment is valid before proceeding

  const courseToEdit = courses.find((course) => course.course_code === assignment.course_code);
  
  // Convert creating faculties from a comma-separated string to an array
  const assignedFacultyNames = assignment.creating_faculties ? assignment.creating_faculties.split(",").map(name => name.trim()) : [];

  // Find matching faculty objects based on the extracted names
  const facultiesToEdit = faculties.filter((faculty) => assignedFacultyNames.includes(faculty.name));

  const inchargeToEdit = faculties.find((faculty) => faculty.user_id === assignment.incharge_faculty_id);
   // Format the deadline to yyyy-mm-dd format for date input
   const formattedDeadline = formatDateForDateInput(assignment.deadline_date);
  setSelectedCourse(courseToEdit || null); // Set course if found, else null
  setInchargeFaculty(inchargeToEdit || null); // Set incharge faculty
  setCreatingFaculties(facultiesToEdit || []); // Set all matched creating faculties
  setDeadline(formattedDeadline || "");
  setCurrentAssignment(assignment); // Store assignment data for editing
  setIsEditMode(true); // Enable edit mode
  setModalOpen(true); // Open the modal
};

const formatDateForDateInput = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0'); // Months are zero-indexed
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Handle Status Change
const handleStatusChange = (index, status) => {
  setAssignments(assignments.map((assignment, i) => 
    i === index ? { ...assignment, status } : assignment
  ));
};

// Handle Snackbar Close
const handleSnackbarClose = () => {
  setSnackbarOpen(false);
};

// Open Modal for New Assignment
const handleOpenModal = () => {
  setIsEditMode(false);
  setSelectedCourse(null);
  setInchargeFaculty(null);
  setCreatingFaculties([]);
  setDeadline("");
  setModalOpen(true);
};

  const IOSSwitch = styled((props) => (
    <Switch focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />
  ))(({ theme }) => ({
    width: 42,
    height: 26,
    padding: 0,
    '& .MuiSwitch-switchBase': {
      padding: 0,
      margin: 2,
      transitionDuration: '300ms',
      '&.Mui-checked': {
        transform: 'translateX(16px)',
        color: '#fff',
        '& + .MuiSwitch-track': {
          backgroundColor: '#673ab7',
          opacity: 1,
          border: 0,
        },
      },
    },
    '& .MuiSwitch-thumb': {
      width: 22,
      height: 22,
    },
    '& .MuiSwitch-track': {
      borderRadius: 26 / 2,
      backgroundColor: '#E9E9EA',
      opacity: 1,
    },
  }));

  useEffect(() => {
    filterCourses();
  }, [departmentFilter, semesterFilter, yearFilter]);

  return (
    <Box sx={{ p: 4, backgroundColor: '#f5f5f5', minHeight: 'calc(100vh - 60px)' }}>
      <Typography variant="h4" gutterBottom
      sx={{textAlign: 'center', fontWeight: 'bold', color: '#673ab7', fontSize: { xs: '1.5rem', sm: '2rem' }, }}>
        Faculty Assignment Page
      </Typography>

      {count > 0 && (
        <Button
        variant="contained"
        onClick={handleOpenModal}
        sx={{
          px: 1.5,
          py: 1,
          fontWeight: 600,
          fontSize: {xs: '0.7rem', sm: '1rem'},
          backgroundColor: "#ede7f6",
          color: "#673ab7",
          pr: 3,
          borderRadius: "40px",
          border: "2px solid #673ab7",
          "&:hover": {
            backgroundColor: "#673ab7",
            color: "#fff",
          },
        }}
      >
        <LibraryAddRounded sx={{ mr: 1 }} /> Assign Course and Faculty
      </Button>
)}
      {count <= 0 ? (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        mt: {xs: 0, sm: 4},
      }}
    >
      <img
        src={image}
        alt="No Assignments Yet"
        style={{
          width: "150px",
          marginBottom: 20,
          opacity: 0.6,
          marginTop: 5,
        }}
      />
      <Typography
        variant="h6"
        sx={{ color: "#424242", fontSize: {xs: '20px', sm: '24px'}, fontWeight: "bold" }}
      >
        No Assignments Created yet
      </Typography>
      <Typography
        variant="body1"
        sx={{ color: "#757575", fontWeight: "bold", mt: 2, mb: 4 }}
      >
        Click the "Assign Faculty for Courses" button to create a new
        assignment and manage faculty assignments effectively!
      </Typography>
      <Button
        variant="contained"
        onClick={handleOpenModal}
        sx={{
          px: 1.5,
          py: 1,
          fontWeight: 600,
          fontSize: {xs: '0.7rem', sm: '1rem'},
          backgroundColor: "#ede7f6",
          color: "#673ab7",
          pr: 3,
          borderRadius: "40px",
          border: "2px solid #673ab7",
          "&:hover": {
            backgroundColor: "#673ab7",
            color: "#fff",
          },
        }}
      >
        <LibraryAddRounded sx={{ mr: 1 }} /> Assign Course and Faculty
      </Button>
      <Typography
        sx={{
          color: "red",
          fontWeight: "bold",
          opacity: 0.3,
          mt: 4,
        }}
      >
        Note: Assignments created will be notified to the corresponding Faculties.
      </Typography>
    </Box>
  ) : (
    <AssignedFacultiesTable
      assignments={assignments}

      onDelete={handleDelete}
      onEdit={handleEdit}
      onStatusChange={handleStatusChange}
    />
  )}

<Modal
      open={modalOpen}
      onClose={() => setModalOpen(false)}
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: { xs: "90%", sm: "600px" },
          maxWidth: "600px",
          bgcolor: "background.paper",
          p: { xs: 3, sm: 4 },
          borderRadius: 3,
          boxShadow: 24,
          overflowY: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/*Heading Text*/}
        <Typography
          id="modal-title"
          variant="h5"
          sx={{
            textAlign: "center",
            fontWeight: "bold",
            mb: 3,
            background: "linear-gradient(45deg, #ff6f00, #ff8f00)",
            WebkitBackgroundClip: "text",
            color: '#673ab7'
          }}
        >
          {isEditMode ? "Edit Course Assignment" : "Select Course and Faculty"}
        </Typography>

        <Box
      sx={{
        flexGrow: 1, // This will make the container grow and take remaining space
        overflowY: 'auto', // Enable vertical scrolling if content overflows
        maxHeight: 'calc(100vh - 250px)', // Limit the height to fit within the screen with a buffer for heading and submit button
        "&::-webkit-scrollbar": {
          display: "none", // Hide the scrollbar in Webkit browsers
        },
        scrollbarWidth: "none", // Hide the scrollbar in Firefox
      }}
    >
      {/* Course Filters */}
      <Grid container spacing={2}>
          {/* Department Filter */}
          <Grid item xs={12} sm={4}>
            <FormControl
              fullWidth
              variant="outlined"
              sx={{
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.15)",
                borderRadius: "10px",
              }}
            >
              <InputLabel
                sx={{
                  fontSize: "14px",
                  fontWeight: "bold",
                  backgroundColor: "white",
                  px: 0.5,
                  color: "#757575",
                  opacity: 0.8,
                }}
              >
                Department
              </InputLabel>
              <Select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      maxHeight: 200,
                      boxShadow: "0 6px 12px rgba(0, 0, 0, 0.2)",
                      borderRadius: "10px",
                      mt: 1,
                      color: '#757575',
                      fontWeight: 'bold',
                      overflowY: "auto",
                      scrollbarWidth: "none",
                      "&::-webkit-scrollbar": {
                        display: "none",
                      },
                    },
                  },
                }}
                sx={{
                  borderRadius: "10px",
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#673ab7",
                  },
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#c0c0c0",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#673ab7",
                  },
                }}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="CS">CSE</MenuItem>
                <MenuItem value="ME">Mechanical</MenuItem>
                <MenuItem value="EC">ECE</MenuItem>
                <MenuItem value="EE">EEE</MenuItem>
                <MenuItem value="CE">Civil</MenuItem>
                <MenuItem value="EI">E&I</MenuItem>
                <MenuItem value="AG">Agri</MenuItem>
                <MenuItem value="FD">Food Design</MenuItem>
                <MenuItem value="FT">Food Tech</MenuItem>
                <MenuItem value="MZ">Mechatronics</MenuItem>
                <MenuItem value="IT">IT</MenuItem>
                <MenuItem value="SE">ISE</MenuItem>
                <MenuItem value="CB">CSBS</MenuItem>
                <MenuItem value="CD">Computer Design</MenuItem>
                <MenuItem value="CT">Computer Tech</MenuItem>
                <MenuItem value="AD">AIDS</MenuItem>
                <MenuItem value="AL">AIML</MenuItem>
                <MenuItem value="BT">Biotech</MenuItem>
                <MenuItem value="BM">Biomedical</MenuItem>
                <MenuItem value="TX">Textile</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Semester Filter */}
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth variant="outlined" sx={{boxShadow: "0 3px 6px rgba(0,0,0,0.16)", borderRadius: "10px"}}>
              <InputLabel
                sx={{
                  fontSize: "14px",
                  backgroundColor: "white",
                  px: 0.5,
                  color: "#757575",
                  fontWeight: 'bold',
                  opacity: 0.8,
                }}
              >
                Semester
              </InputLabel>
              <Select
                value={semesterFilter}
                onChange={(e) => setSemesterFilter(e.target.value)}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      maxHeight: 200,
                      boxShadow: "0 6px 12px rgba(0, 0, 0, 0.2)",
                      borderRadius: "10px",
                      mt: 1,
                      color: '#757575',
                      fontWeight: 'bold',
                      overflowY: "auto",
                      scrollbarWidth: "none",
                      "&::-webkit-scrollbar": {
                        display: "none",
                      },
                    },
                  },
                }}
                sx={{
                  borderRadius: "10px",
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#673ab7",
                  },
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#c0c0c0",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#673ab7",
                  },
                }}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="1">1</MenuItem>
                <MenuItem value="2">2</MenuItem>
                <MenuItem value="3">3</MenuItem>
                <MenuItem value="4">4</MenuItem>
                <MenuItem value="5">5</MenuItem>
                <MenuItem value="6">6</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Academic Year Filter */}
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth variant="outlined" sx={{boxShadow: "0 3px 6px rgba(0,0,0,0.16)", borderRadius: "10px"}}>
              <InputLabel
                sx={{
                  fontSize: "14px",
                  backgroundColor: "white",
                  px: 0.5,
                  opacity: 0.8,
                  color: "#757575",
                  fontWeight: 'bold',
                }}
              >
                Academic Year
              </InputLabel>
              <Select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      maxHeight: 200,
                      boxShadow: "0 6px 12px rgba(0, 0, 0, 0.2)",
                      borderRadius: "10px",
                      mt: 1,
                      color: '#757575',
                      fontWeight: 'bold',
                      overflowY: "auto",
                      scrollbarWidth: "none",
                      "&::-webkit-scrollbar": {
                        display: "none",
                      },
                    },
                  },
                }}
                sx={{
                  borderRadius: "10px",
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#673ab7",
                  },
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#c0c0c0",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#673ab7",
                  },
                }}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="2023-2024">2023-2024</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* Course Selection */}
<Autocomplete
  options={filteredCourses}
  value={selectedCourse || null}
  getOptionLabel={(option) => `${option.course_code} - ${option.course_name}`}
  onChange={handleCourseChange}
  renderInput={(params) => (
    <TextField
      {...params}
      label={
        <Typography sx={{ fontWeight: 'bold', color: '#757575', opacity: 0.8 }}>
          Select Course
        </Typography>
      }
      margin="normal"
      fullWidth
      placeholder="Select Course"
      sx={{
        borderRadius: "10px",
        boxShadow: "0 3px 6px rgba(0,0,0,0.16)",
        "&:hover .MuiOutlinedInput-notchedOutline": {
          borderColor: "#673ab7",
        },
        "& .MuiOutlinedInput-notchedOutline": {
          borderColor: "#c0c0c0",
        },
        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
          borderColor: "#673ab7",
        },
      }}
    />
  )}
  renderOption={(props, option) => (
    <li {...props} key={`${option.course_code}-${option.course_name}`}> {/* Ensure unique key here */}
      {`${option.course_code} - ${option.course_name}`}
    </li>
  )}
/>


        {/* Incharge Faculty Selection */}
        {/* Incharge Faculty Selection */}
<Autocomplete
  options={disableFilter ? faculties : filteredFaculties}
  value={inchargeFaculty}
  getOptionLabel={(option) => `${option.user_id} - ${option.name}`}
  onChange={handleInchargeChange}
  renderInput={(params) => (
    <TextField
      {...params}
      label={
        <Typography sx={{ fontWeight: 'bold', color: '#757575', opacity: 0.8 }}>
          Select Incharge Faculty
        </Typography>
      }
      margin="normal"
      fullWidth
      sx={{
        borderRadius: "10px",
        boxShadow: "0 3px 6px rgba(0,0,0,0.16)",
        "&:hover .MuiOutlinedInput-notchedOutline": {
          borderColor: "#673ab7",
        },
        "& .MuiOutlinedInput-notchedOutline": {
          borderColor: "#c0c0c0",
        },
        "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
          borderColor: "#673ab7",
        },
      }}
    />
  )}
  renderOption={(props, option) => (
    <li {...props} key={option.user_id ? option.user_id : `fallback-key-${option.name}`}>
      {`${option.user_id} - ${option.name}`}
    </li>
  )}
/>


        {/* Creating Faculties Selection */}
        <Autocomplete
          multiple
          options={disableFilter ? faculties : filteredFaculties}
          value={creatingFaculties}
          getOptionLabel={(option) => `${option.user_id} - ${option.name}`}
          onChange={handleCreatingFacultiesChange}
          disableCloseOnSelect
          renderInput={(params) => (
            <TextField
              {...params}
              label={
                <Typography sx={{fontWeight: 'bold', color: '#757575', opacity: 0.8}}>
                  Select Faculties
                </Typography>
              }
              margin="normal"
              fullWidth
              sx={{
                borderRadius: "10px",
                boxShadow: "0 3px 6px rgba(0,0,0,0.16)",
                "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#673ab7",
                  },
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#c0c0c0",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#673ab7",
                  },
              }}
            />
          )}
          renderOption={(props, option) => (
            <li {...props}>
              <Checkbox checked={creatingFaculties.indexOf(option) > -1} />
              {`${option.user_id} - ${option.name}`}
            </li>
          )}
        />

        {/* Deadline Selection */}
<TextField
  label={
    <Typography sx={{ fontWeight: 'bold', color: '#757575', opacity: 0.8 }}>
      Select Deadline
    </Typography>
  }
  type="date"
  value={deadline}
  onChange={(e) => setDeadline(e.target.value)}
  fullWidth
  sx={{
    marginTop: 2,
    borderRadius: "10px",
    boxShadow: "0 3px 6px rgba(0,0,0,0.16)",
    "&:hover .MuiOutlinedInput-notchedOutline": {
      borderColor: "#673ab7",
    },
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: "#c0c0c0",
    },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
      borderColor: "#673ab7",
    },
  }}
  InputLabelProps={{
    shrink: true,
  }}
  InputProps={{
    inputProps: {
      min: currentDate, // Disable dates before today
    }
  }}
/>


        {/* Disable Filter Switch */}
        <FormControlLabel
          control={
            <IOSSwitch
              checked={disableFilter}
              onChange={handleFilterToggle}
            />
          }
          label={
            <Typography
              sx={{
                fontWeight: "bold",
                color: "#673ab7",
              }}
            >
              Disable Department Filter
            </Typography>
          }
          sx={{
            mt: 2,
            ml: "0px",
            gap: "10px",
          }}
        />

    </Box>

        
        {/* Submit Button */}
        <Button
          variant="contained"
          onClick={handleSubmit}
          fullWidth
          sx={{
            mt: 3,
            py: 1.5,
            fontWeight: "bold",
            background: "linear-gradient(45deg, #673ab7, #512da8)",
            color: "#fff",
            "&:hover": {
              background: "linear-gradient(45deg, #512da8, #311b92)",
            },
          }}
        >
          {isEditMode ? "Save Changes" : "Assign Faculty"}
        </Button>
      </Box>
    </Modal>



      {/* Confirmation Modal */}
      <Modal open={confirmationModalOpen} onClose={() => setConfirmationModalOpen(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: {xs: '85%', sm: '500px'},
            bgcolor: "background.paper",
            p: {xs: 3, sm: 4},
            borderRadius: 2,
            boxShadow: 24,
          }}
        >
          <Typography variant="h6" gutterBottom sx={{color: '#673ab7', fontWeight: 'bold', }}>
            Confirm New Assignment
          </Typography>
          <Typography variant="body1" gutterBottom sx={{color: '#757575', fontWeight: 'bold', }}>
            Are you sure you want to assign faculties for this Course ({selectedCourse?.name} - {selectedCourse?.code}) along with the course incharge ({inchargeFaculty?.name})?
          </Typography>

          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={6}>
              <Button
                variant="contained"
                fullWidth
                onClick={handleConfirmSubmit}
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
                Confirm
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button
                fullWidth
                onClick={() => setConfirmationModalOpen(false)}
                sx={{color: '#757575', textTransform: 'none', fontWeight: 'bold', border: '2px solid #757575', '&:hover' : {color: '#424242'}}}
              >
                Cancel
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Modal>

      <Modal open={editConfirmationModalOpen} onClose={() => setEditConfirmationModalOpen(false)}>
  <Box
    sx={{
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      width: {xs: '85%', sm: '500px'},
      bgcolor: "background.paper",
      p: {xs: 3, sm: 4},
      borderRadius: 2,
      boxShadow: 24,
    }}
  >
    <Typography variant="h6" gutterBottom sx={{color: '#673ab7', fontWeight: 'bold', }}>
      Confirm the Edited Changes
    </Typography>
    <Typography variant="body1" gutterBottom sx={{color: '#757575', fontWeight: 'bold', }}>
      Are you sure you want to save the changes for this Course ({selectedCourse?.name} - {selectedCourse?.code}) with the course incharge ({inchargeFaculty?.name})?
    </Typography>

    <Grid container spacing={2} sx={{ mt: 2 }}>
      <Grid item xs={6}>
        <Button
          variant="contained"
          fullWidth
          onClick={handleEditConfirmSubmit} // Handle save changes for editing
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
          Save
        </Button>
      </Grid>
      <Grid item xs={6}>
        <Button
          fullWidth
          onClick={() => setEditConfirmationModalOpen(false)} // Close the edit confirmation modal
          sx={{color: '#757575', textTransform: 'none', fontWeight: 'bold', border: '2px solid #757575', '&:hover' : {color: '#424242'}}}
        >
          Cancel
        </Button>
      </Grid>
    </Grid>
  </Box>
</Modal>


      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default FacultyAssign;
