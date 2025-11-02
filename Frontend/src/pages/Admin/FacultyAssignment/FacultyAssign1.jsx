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
import { Edit, Delete, Add, AutoDeleteRounded, LibraryAddRounded } from "@mui/icons-material";
import { styled } from '@mui/material/styles';

const FacultyAssign = () => {
  // Dummy Data
  const courses = [
    { code: "CS101", name: "Computer Science 101", department: "CSE", semester: 1, year: "2023-2024" },
    { code: "MATH202", name: "Advanced Mathematics", department: "Mathematics", semester: 2, year: "2023-2024" },
    { code: "PHY303", name: "Physics Basics", department: "Physics", semester: 1, year: "2023-2024" },
    { code: "CHEM404", name: "Chemistry Essentials", department: "Chemistry", semester: 2, year: "2023-2024" },
    { code: "BIO505", name: "Biology Fundamentals", department: "Biology", semester: 1, year: "2023-2024" },
    { code: "ENG606", name: "English Literature", department: "English", semester: 2, year: "2023-2024" },
    { code: "HIST707", name: "World History", department: "History", semester: 1, year: "2023-2024" },
    { code: "ECON808", name: "Economics Basics", department: "Economics", semester: 2, year: "2023-2024" },
    { code: "ART909", name: "Art and Design", department: "Art", semester: 1, year: "2023-2024" },
    { code: "MUSIC1010", name: "Music Theory", department: "Music", semester: 2, year: "2023-2024" },
  ];

  const faculties = [
    { id: "F001", name: "John Doe", department: "CSE" },
    { id: "F002", name: "Jane Smith", department: "Mathematics" },
    { id: "F003", name: "Alice Johnson", department: "Physics" },
    { id: "F004", name: "Robert Brown", department: "Chemistry" },
    { id: "F005", name: "Emily Davis", department: "Biology" },
    { id: "F006", name: "Michael Wilson", department: "English" },
    { id: "F007", name: "Sarah Miller", department: "History" },
    { id: "F008", name: "David Moore", department: "Economics" },
    { id: "F009", name: "Sophia Taylor", department: "Art" },
    { id: "F010", name: "Daniel Anderson", department: "Music" },
  ];

  // States
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [filteredCourses, setFilteredCourses] = useState(courses);
  const [filteredFaculties, setFilteredFaculties] = useState([]);
  const [inchargeFaculty, setInchargeFaculty] = useState(null);
  const [creatingFaculties, setCreatingFaculties] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmationModalOpen, setConfirmationModalOpen] = useState(false);
  const [disableFilter, setDisableFilter] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  const [assignments, setAssignments] = useState(() => {
    const savedAssignments = localStorage.getItem("assignments");
    return savedAssignments ? JSON.parse(savedAssignments) : [];
  });

  const [departmentFilter, setDepartmentFilter] = useState("");
  const [semesterFilter, setSemesterFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [deadline, setDeadline] = useState(""); // Initialize the deadline state
  const currentDate = new Date().toISOString().split('T')[0];

  const [isEditMode, setIsEditMode] = useState(false);
  const [currentAssignment, setCurrentAssignment] = useState(null);
  const [editConfirmationModalOpen, setEditConfirmationModalOpen] = useState(false);

  // Save to local storage whenever assignments change
  useEffect(() => {
    localStorage.setItem("assignments", JSON.stringify(assignments));
  }, [assignments]);

  // Handlers
  const handleCourseChange = (event, value) => {
    setSelectedCourse(value);
    if (value && !disableFilter) {
      const filtered = faculties.filter(
        (faculty) => faculty.department === value.department
      );
      setFilteredFaculties(filtered);
    } else {
      setFilteredFaculties(faculties);
    }
  };

  const handleInchargeChange = (event, value) => {
    setInchargeFaculty(value);
  };

  const handleCreatingFacultiesChange = (event, value) => {
    if (value.some((faculty, index) => value.indexOf(faculty) !== index)) {
      setSnackbarMessage("Duplicate faculty selected for creating faculty.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } else {
      setCreatingFaculties(value);
    }
  };

  const handleFilterToggle = () => {
    setDisableFilter((prev) => !prev);
    if (selectedCourse && disableFilter) {
      const filtered = faculties.filter(
        (faculty) => faculty.department === selectedCourse.department
      );
      setSnackbarOpen(true);
    } else {
      setFilteredFaculties(faculties);
      setSnackbarMessage("Department Filter is disabled. All faculties are now displayed.");
      setSnackbarSeverity("info");
      setSnackbarOpen(true);
    }
  };

  const filterCourses = () => {
    let filtered = courses;
    if (departmentFilter) {
      filtered = filtered.filter((course) => course.department === departmentFilter);
    }
    if (semesterFilter) {
      filtered = filtered.filter((course) => course.semester === parseInt(semesterFilter));
    }
    if (yearFilter) {
      filtered = filtered.filter((course) => course.year === yearFilter);
    }
    setFilteredCourses(filtered);
  };

  const handleFilterChange = () => {
    filterCourses();
  };

  const handleSubmit = () => {
    if (selectedCourse && inchargeFaculty && deadline && creatingFaculties.length > 0) {
      if (isEditMode) {
        setEditConfirmationModalOpen(true);
      } else {
        setConfirmationModalOpen(true);
      }
    } else {
      setSnackbarMessage("Please select a Course, an Incharge Faculty, and at least one creating faculty with a deadline.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    }
  };

  const handleEditConfirmSubmit = () => {
    const updatedAssignment = {
      ...currentAssignment,
      courseCode: selectedCourse.code,
      courseName: selectedCourse.name,
      incharge: inchargeFaculty.name,
      creatingFaculties: creatingFaculties.map((faculty) => faculty.name),
      status: currentAssignment.status,
      deadline: deadline,  // Add deadline to the updated assignment
    };
  
    const updatedAssignments = assignments.map((assignment) =>
      assignment === currentAssignment ? updatedAssignment : assignment
    );
  
    setAssignments(updatedAssignments);
    setSnackbarMessage("Assignment updated successfully.");
    setSnackbarSeverity("success");
    setSnackbarOpen(true);
    setEditConfirmationModalOpen(false);
    setModalOpen(false);
  };

  const handleConfirmSubmit = () => {
    const newAssignment = {
      courseCode: selectedCourse.code,
      courseName: selectedCourse.name,
      assignedAt: new Date().toLocaleString(),
      incharge: inchargeFaculty.name,
      creatingFaculties: creatingFaculties.map((faculty) => faculty.name),
      status: "Pending",
      deadline: deadline,  // Add deadline to the new assignment
    };
  
    setAssignments([...assignments, newAssignment]);
    setSnackbarMessage("Faculty assignment successful!");
    setSnackbarSeverity("success");
    setSnackbarOpen(true);
    setConfirmationModalOpen(false);
    setModalOpen(false);
  };
  

  const handleDelete = (index) => {
    const updatedAssignments = assignments.filter((_, i) => i !== index);
    setAssignments(updatedAssignments);
    setSnackbarMessage("Assignment deleted successfully.");
    setSnackbarSeverity("info");
    setSnackbarOpen(true);
  };

  const handleEdit = (index) => {
    const assignmentToEdit = assignments[index];
    const courseToEdit = courses.find((course) => course.code === assignmentToEdit.courseCode);
    const facultiesToEdit = faculties.filter((faculty) =>
      assignmentToEdit.creatingFaculties.includes(faculty.name)
    );
    const inchargeToEdit = faculties.find((faculty) => faculty.name === assignmentToEdit.incharge);

    setSelectedCourse(courseToEdit);
    setInchargeFaculty(inchargeToEdit);
    setCreatingFaculties(facultiesToEdit);
    setCurrentAssignment(assignmentToEdit);
    setIsEditMode(true);
    setModalOpen(true);
  };

  const handleStatusChange = (index, status) => {
    const updatedAssignments = [...assignments];
    updatedAssignments[index].status = status;
    setAssignments(updatedAssignments);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  const handleOpenModal = () => {
    setIsEditMode(false);
    setSelectedCourse(null);
    setInchargeFaculty(null);
    setCreatingFaculties([]);
    setModalOpen(true);
  };

  const scrollableStyle = {
    maxHeight: 200,
    overflowY: "auto",
    scrollbarWidth: "none",
    msOverflowStyle: "none",
    "&::-webkit-scrollbar": {
      display: "none",
    },
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

      {assignments.length > 0 && (
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

      {assignments.length === 0 ? (
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
        }}
      >
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
                <MenuItem value="CSE">CSE</MenuItem>
                <MenuItem value="Mathematics">Mathematics</MenuItem>
                <MenuItem value="Physics">Physics</MenuItem>
                <MenuItem value="Chemistry">Chemistry</MenuItem>
                <MenuItem value="Biology">Biology</MenuItem>
                <MenuItem value="English">English</MenuItem>
                <MenuItem value="History">History</MenuItem>
                <MenuItem value="Economics">Economics</MenuItem>
                <MenuItem value="Art">Art</MenuItem>
                <MenuItem value="Music">Music</MenuItem>
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
          getOptionLabel={(option) => `${option.code} - ${option.name}`}
          onChange={handleCourseChange}
          renderInput={(params) => (
            <TextField
              {...params}
              label={
                <Typography sx={{fontWeight: 'bold', color: '#757575', opacity: 0.8}}>
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
        />

        {/* Incharge Faculty Selection */}
        <Autocomplete
          options={disableFilter ? faculties : filteredFaculties}
          value={inchargeFaculty}
          getOptionLabel={(option) => `${option.id} - ${option.name}`}
          onChange={handleInchargeChange}
          renderInput={(params) => (
            <TextField
              {...params}
              label={
                <Typography sx={{fontWeight: 'bold', color: '#757575', opacity: 0.8}}>
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
        />

        {/* Creating Faculties Selection */}
        <Autocomplete
          multiple
          options={disableFilter ? faculties : filteredFaculties}
          value={creatingFaculties}
          getOptionLabel={(option) => `${option.id} - ${option.name}`}
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
              {`${option.id} - ${option.name}`}
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
