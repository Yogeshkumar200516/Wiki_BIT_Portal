import React from "react";
import {
  Modal, Box, Typography, Grid, FormControl, InputLabel,
  Select, MenuItem, TextField, Autocomplete, Checkbox, FormControlLabel, Button, Switch,
} from "@mui/material";
import { styled, createTheme, ThemeProvider } from "@mui/material/styles";
import { LibraryAddRounded } from "@mui/icons-material";

const theme = createTheme({
  typography: { fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif" },
  shape: { borderRadius: 12 },
  components: {
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundColor: "#faf8ff",
          "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#5c35d9" },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#5c35d9", borderWidth: 2 },
          "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e0d7f8" },
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: { color: "#8b7db8", fontWeight: 600, fontSize: 13, "&.Mui-focused": { color: "#5c35d9" } },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          fontSize: 13, fontWeight: 500,
          "&:hover": { backgroundColor: "#f0ebff" },
          "&.Mui-selected": { backgroundColor: "#ede5ff", color: "#5c35d9", fontWeight: 700 },
        },
      },
    },
    MuiButton: {
      styleOverrides: { root: { borderRadius: 12, textTransform: "none", fontWeight: 700 } },
    },
  },
});

const IOSSwitch = styled((props) => (
  <Switch focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />
))(({ theme }) => ({
  width: 44, height: 26, padding: 0,
  "& .MuiSwitch-switchBase": {
    padding: 0, margin: 2, transitionDuration: "300ms",
    "&.Mui-checked": {
      transform: "translateX(18px)", color: "#fff",
      "& + .MuiSwitch-track": { backgroundColor: "#5c35d9", opacity: 1 },
    },
  },
  "& .MuiSwitch-thumb": { width: 22, height: 22, boxShadow: "0 2px 6px rgba(0,0,0,0.2)" },
  "& .MuiSwitch-track": { borderRadius: 13, backgroundColor: "#ddd6f5", opacity: 1 },
}));

const SectionLabel = ({ children }) => (
  <Typography sx={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.1em", textTransform: "uppercase", color: "#a091cc", mb: 1, mt: 2.5 }}>
    {children}
  </Typography>
);

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "12px", backgroundColor: "#faf8ff",
    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#5c35d9" },
    "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#5c35d9", borderWidth: 2 },
  },
  "& .MuiOutlinedInput-notchedOutline": { borderColor: "#e0d7f8" },
};

const FacultyAssignModal = ({
  modalOpen, setModalOpen, isEditMode,
  departmentFilter, setDepartmentFilter,
  semesterFilter, setSemesterFilter,
  yearFilter, setYearFilter,
  filteredCourses, selectedCourse, handleCourseChange,
  faculties, filteredFaculties,
  inchargeFaculty, handleInchargeChange,
  creatingFaculties, handleCreatingFacultiesChange,
  deadline, setDeadline,
  currentDate, disableFilter, handleFilterToggle, handleSubmit,
}) => {
  const depts = [
    ["CS","CSE"],["ME","Mechanical"],["EC","ECE"],["EE","EEE"],["CE","Civil"],
    ["EI","E&I"],["AG","Agri"],["FD","Food Design"],["FT","Food Tech"],["MZ","Mechatronics"],
    ["IT","IT"],["SE","ISE"],["CB","CSBS"],["CD","Computer Design"],["CT","Computer Tech"],
    ["AD","AIDS"],["AL","AIML"],["BT","Biotech"],["BM","Biomedical"],["TX","Textile"],
  ];

  return (
    <ThemeProvider theme={theme}>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <Box sx={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: { xs: "92%", sm: 580 }, maxWidth: 580,
          bgcolor: "#fff", borderRadius: "20px",
          boxShadow: "0 32px 80px rgba(92,53,217,0.22)",
          border: "1px solid #ede5ff",
          display: "flex", flexDirection: "column",
          maxHeight: "90vh", overflow: "hidden",
        }}>

          {/* Header */}
          <Box sx={{
            px: 4, pt: 3.5, pb: 2.5,
            borderBottom: "1px solid #f0ebff",
            background: "linear-gradient(135deg, #faf8ff 0%, #f5f0ff 100%)",
            flexShrink: 0,
          }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box sx={{
                width: 36, height: 36, borderRadius: "10px",
                background: "linear-gradient(135deg, #5c35d9, #7c5ce8)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <LibraryAddRounded sx={{ color: "#fff", fontSize: 18 }} />
              </Box>
              <Box>
                <Typography sx={{ fontWeight: 800, fontSize: "1.05rem", color: "#1a0f3c", lineHeight: 1.2 }}>
                  {isEditMode ? "Edit Assignment" : "New Assignment"}
                </Typography>
                <Typography sx={{ fontSize: "0.75rem", color: "#a091cc" }}>
                  {isEditMode ? "Update the course-faculty mapping" : "Assign faculty to a course"}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Scrollable body */}
          <Box sx={{ px: 4, py: 2, overflowY: "auto", flex: 1, scrollbarWidth: "none", "&::-webkit-scrollbar": { display: "none" } }}>
            <SectionLabel>Filter Courses</SectionLabel>
            <Grid container spacing={1.5}>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth variant="outlined" size="small">
                  <InputLabel>Department</InputLabel>
                  <Select value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)} label="Department"
                    MenuProps={{ PaperProps: { sx: { maxHeight: 220, scrollbarWidth: "none", "&::-webkit-scrollbar": { display: "none" } } } }}
                  >
                    <MenuItem value="">All</MenuItem>
                    {depts.map(([v, l]) => <MenuItem key={v} value={v}>{l}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6} sm={4}>
                <FormControl fullWidth variant="outlined" size="small">
                  <InputLabel>Semester</InputLabel>
                  <Select value={semesterFilter} onChange={(e) => setSemesterFilter(e.target.value)} label="Semester">
                    <MenuItem value="">All</MenuItem>
                    {[1,2,3,4,5,6,7,8].map(n => <MenuItem key={n} value={String(n)}>{n}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={6} sm={4}>
                <FormControl fullWidth variant="outlined" size="small">
                  <InputLabel>Year</InputLabel>
                  <Select value={yearFilter} onChange={(e) => setYearFilter(e.target.value)} label="Year">
                    <MenuItem value="">All</MenuItem>
                    {["2023-2024","2024-2025","2025-2026"].map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            <SectionLabel>Course & Faculty</SectionLabel>
            <Autocomplete
              options={filteredCourses} value={selectedCourse || null}
              getOptionLabel={(o) => `${o.code} - ${o.name}`}
              onChange={handleCourseChange}
              renderOption={(props, option) => (
                <li {...props} key={`${option.code}-${option.name}`}>
                  <Box>
                    <Typography sx={{ fontWeight: 700, fontSize: 13 }}>{option.code}</Typography>
                    <Typography sx={{ fontSize: 12, color: "#8b7db8" }}>{option.name}</Typography>
                  </Box>
                </li>
              )}
              renderInput={(params) => <TextField {...params} label="Select Course" size="small" fullWidth sx={fieldSx} />}
            />

            <Box sx={{ mt: 1.5 }}>
              <Autocomplete
                options={disableFilter ? faculties : filteredFaculties}
                value={inchargeFaculty}
                getOptionLabel={(o) => `${o.id} - ${o.name}`}
                onChange={handleInchargeChange}
                renderOption={(props, option) => (
                  <li {...props} key={option.id ?? `fb-${option.name}`}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Box sx={{ width: 28, height: 28, borderRadius: "50%", background: "#ede5ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: "#5c35d9" }}>
                        {(option.name || "").slice(0, 2).toUpperCase()}
                      </Box>
                      <Box>
                        <Typography sx={{ fontWeight: 700, fontSize: 13 }}>{option.name}</Typography>
                        <Typography sx={{ fontSize: 11, color: "#a091cc" }}>{option.id}</Typography>
                      </Box>
                    </Box>
                  </li>
                )}
                renderInput={(params) => <TextField {...params} label="Incharge Faculty" size="small" fullWidth sx={fieldSx} />}
              />
            </Box>

            <Box sx={{ mt: 1.5 }}>
              <Autocomplete
                multiple disableCloseOnSelect
                options={disableFilter ? faculties : filteredFaculties}
                value={creatingFaculties}
                getOptionLabel={(o) => `${o.id} - ${o.name}`}
                onChange={handleCreatingFacultiesChange}
                renderOption={(props, option) => (
                  <li {...props}>
                    <Checkbox
                      checked={creatingFaculties.indexOf(option) > -1}
                      sx={{ color: "#c4b8e8", "&.Mui-checked": { color: "#5c35d9" }, p: 0.5, mr: 1 }}
                      size="small"
                    />
                    <Typography sx={{ fontSize: 13 }}>{option.id} — {option.name}</Typography>
                  </li>
                )}
                renderInput={(params) => <TextField {...params} label="Select Faculties (multiple)" size="small" fullWidth sx={fieldSx} />}
              />
            </Box>

            <SectionLabel>Deadline</SectionLabel>
            <TextField
              label="Deadline Date" type="date" value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              fullWidth size="small"
              InputLabelProps={{ shrink: true }}
              InputProps={{ inputProps: { min: currentDate } }}
              sx={fieldSx}
            />

            <Box sx={{
              mt: 2.5, p: 2, borderRadius: "12px",
              background: disableFilter ? "linear-gradient(135deg, #ede5ff, #e0d7f8)" : "#faf8ff",
              border: "1px solid", borderColor: disableFilter ? "#c4b8e8" : "#ede5ff",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              transition: "all 0.2s ease",
            }}>
              <Box>
                <Typography sx={{ fontWeight: 700, fontSize: "0.82rem", color: "#1a0f3c" }}>Disable Department Filter</Typography>
                <Typography sx={{ fontSize: "0.73rem", color: "#a091cc" }}>Show faculty from all departments</Typography>
              </Box>
              <IOSSwitch checked={disableFilter} onChange={handleFilterToggle} />
            </Box>
          </Box>

          {/* Footer */}
          <Box sx={{ px: 4, py: 2.5, borderTop: "1px solid #f0ebff", flexShrink: 0 }}>
            <Box sx={{ display: "flex", gap: 1.5 }}>
              <Button fullWidth variant="outlined" onClick={() => setModalOpen(false)}
                sx={{ borderColor: "#e0d7f8", color: "#8b7db8", "&:hover": { borderColor: "#5c35d9", color: "#5c35d9", background: "#faf8ff" } }}
              >Cancel</Button>
              <Button fullWidth variant="contained" onClick={handleSubmit}
                sx={{
                  background: "linear-gradient(135deg, #5c35d9 0%, #7c5ce8 100%)", color: "#fff", py: 1.2,
                  boxShadow: "0 4px 16px rgba(92,53,217,0.35)",
                  "&:hover": { background: "linear-gradient(135deg, #4a27c7 0%, #6a4ad6 100%)", boxShadow: "0 6px 20px rgba(92,53,217,0.45)" },
                }}
              >
                {isEditMode ? "Save Changes" : "Assign Faculty"}
              </Button>
            </Box>
          </Box>
        </Box>
      </Modal>
    </ThemeProvider>
  );
};

export default FacultyAssignModal;