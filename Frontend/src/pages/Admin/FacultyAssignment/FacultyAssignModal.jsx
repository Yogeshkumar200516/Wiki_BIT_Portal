import React from "react";
import {
  Modal,
  Box,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  Switch,
  MenuItem,
  TextField,
  Autocomplete,
  Checkbox,
  FormControlLabel,
  Button,
} from "@mui/material";
import { styled } from '@mui/material/styles';

const FacultyAssignModal = ({
  modalOpen,
  setModalOpen,
  isEditMode,
  departmentFilter,
  setDepartmentFilter,
  semesterFilter,
  setSemesterFilter,
  yearFilter,
  setYearFilter,
  filteredCourses,
  selectedCourse,
  handleCourseChange,
  faculties,
  filteredFaculties,
  inchargeFaculty,
  handleInchargeChange,
  creatingFaculties,
  handleCreatingFacultiesChange,
  deadline,
  setDeadline,
  currentDate,
  disableFilter,
  handleFilterToggle,
  handleSubmit,
}) => {

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
  return (
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
            color: "#673ab7",
          }}
        >
          {isEditMode ? "Edit Course Assignment" : "Select Course and Faculty"}
        </Typography>

        {/* Department Filter */}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Department</InputLabel>
              <Select
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="CSE">CSE</MenuItem>
                <MenuItem value="Mathematics">Mathematics</MenuItem>
                <MenuItem value="Physics">Physics</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Semester Filter */}
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Semester</InputLabel>
              <Select
                value={semesterFilter}
                onChange={(e) => setSemesterFilter(e.target.value)}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="1">1</MenuItem>
                <MenuItem value="2">2</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Academic Year Filter */}
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Academic Year</InputLabel>
              <Select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
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
          renderInput={(params) => <TextField {...params} label="Select Course" fullWidth />}
        />

        {/* Incharge Faculty Selection */}
        <Autocomplete
          options={disableFilter ? faculties : filteredFaculties}
          value={inchargeFaculty}
          getOptionLabel={(option) => `${option.id} - ${option.name}`}
          onChange={handleInchargeChange}
          renderInput={(params) => <TextField {...params} label="Select Incharge Faculty" fullWidth />}
        />

        {/* Creating Faculties Selection */}
        <Autocomplete
          multiple
          options={disableFilter ? faculties : filteredFaculties}
          value={creatingFaculties}
          getOptionLabel={(option) => `${option.id} - ${option.name}`}
          onChange={handleCreatingFacultiesChange}
          disableCloseOnSelect
          renderInput={(params) => <TextField {...params} label="Select Faculties" fullWidth />}
          renderOption={(props, option) => (
            <li {...props}>
              <Checkbox checked={creatingFaculties.indexOf(option) > -1} />
              {`${option.id} - ${option.name}`}
            </li>
          )}
        />

        {/* Deadline Selection */}
        <TextField
          label="Select Deadline"
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          fullWidth
          InputLabelProps={{ shrink: true }}
          InputProps={{
            inputProps: { min: currentDate },
          }}
        />

        {/* Disable Filter Switch */}
        <FormControlLabel
          control={<IOSSwitch checked={disableFilter} onChange={handleFilterToggle} />}
          label="Disable Department Filter"
        />

        {/* Submit Button */}
        <Button variant="contained" onClick={handleSubmit} fullWidth>
          {isEditMode ? "Save Changes" : "Assign Faculty"}
        </Button>
      </Box>
    </Modal>
  );
};

export default FacultyAssignModal;
