// src/components/UnitModal.jsx (UnitCreateModal)
import React from 'react';
import { Modal, Box, Typography, Button, FormControl, InputLabel, Select, MenuItem, TextField } from '@mui/material';

const inputSx = {
  "& .MuiInputLabel-root": {
    color: "#64748b",
    fontWeight: 700,
    fontFamily: "'Outfit', sans-serif",
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: "#673ab7",
  },
  "& .MuiOutlinedInput-root": {
    borderRadius: "12px",
    fontFamily: "'Outfit', sans-serif",
    fontWeight: 500,
    "&:hover fieldset": { borderColor: "#9c6edd" },
    "&.Mui-focused fieldset": { borderColor: "#673ab7", borderWidth: "2px" },
  },
};

const UnitModal = ({
  modalOpen,
  handleModalClose,
  isEdit,
  currentUnit,
  setCurrentUnit,
  unitError,
  setUnitError,
  showSnackbar,
  handleOpenConfirmation,
}) => {
  return (
    <Modal open={modalOpen} onClose={handleModalClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: { xs: "95%", sm: "90%", md: "70%", lg: "60%" },
          maxWidth: "600px",
          maxHeight: "90vh",
          bgcolor: "#fff",
          borderRadius: "20px",
          boxShadow: "0 24px 60px rgba(15,5,40,0.22)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          animation: "modalIn 0.28s cubic-bezier(0.34,1.56,0.64,1) both",
          '@keyframes modalIn': {
            from: { opacity: 0, transform: 'translate(-50%,-48%) scale(0.94)' },
            to:   { opacity: 1, transform: 'translate(-50%,-50%) scale(1)' },
          },
          fontFamily: "'Outfit', sans-serif",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            background: "linear-gradient(135deg, #f9f6ff 0%, #ede7f6 100%)",
            padding: "20px 24px 16px",
            borderBottom: "1.5px solid #e8e3f5",
            textAlign: "center",
            flexShrink: 0,
          }}
        >
          <Typography
            sx={{
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 800,
              color: "#673ab7",
              fontSize: { xs: "1.1rem", sm: "1.3rem" },
            }}
          >
            {isEdit ? "Edit Unit" : "Add New Unit"}
          </Typography>
          <Typography sx={{ color: "#94a3b8", fontSize: "0.82rem", mt: 0.5, fontFamily: "'Outfit', sans-serif" }}>
            {isEdit ? "Update the unit details below" : "Fill in the details to create a new unit"}
          </Typography>
        </Box>

        {/* Scrollable body */}
        <Box
          sx={{
            flex: 1,
            padding: "20px 24px",
            overflowY: "auto",
            scrollbarWidth: "none",
            '&::-webkit-scrollbar': { display: 'none' },
            display: "flex",
            flexDirection: "column",
            gap: "14px",
          }}
        >
          {/* Unit number + name row */}
          <Box display="flex" flexDirection={{ xs: "column", sm: "row" }} gap={2}>
            <FormControl fullWidth sx={inputSx}>
              <InputLabel sx={{ backgroundColor: "white", padding: "0 5px" }}>
                Unit Number
              </InputLabel>
              <Select
                value={currentUnit.number}
                onChange={(e) => setCurrentUnit({ ...currentUnit, number: e.target.value })}
                sx={{ borderRadius: "12px", fontFamily: "'Outfit', sans-serif" }}
              >
                {[...Array(10).keys()].map((n) => (
                  <MenuItem key={n + 1} value={n + 1} sx={{ fontFamily: "'Outfit', sans-serif" }}>
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
              sx={inputSx}
              error={unitError.name}
              helperText={unitError.name ? "Unit Name is required." : ""}
            />
          </Box>

          <TextField label="Introduction" multiline rows={3} value={currentUnit.introduction}
            onChange={(e) => setCurrentUnit({ ...currentUnit, introduction: e.target.value })}
            fullWidth sx={inputSx} />

          <TextField label="Summary" multiline rows={3} value={currentUnit.summary}
            onChange={(e) => setCurrentUnit({ ...currentUnit, summary: e.target.value })}
            fullWidth sx={inputSx} />

          <TextField label="References" multiline rows={2} value={currentUnit.references}
            onChange={(e) => setCurrentUnit({ ...currentUnit, references: e.target.value })}
            fullWidth sx={inputSx} />

          <Box display="flex" flexDirection="column" gap={2}>
            <TextField label="Objectives" multiline rows={2} value={currentUnit.objectives}
              onChange={(e) => setCurrentUnit({ ...currentUnit, objectives: e.target.value })}
              fullWidth sx={inputSx} />
            <TextField label="Outcomes" multiline rows={2} value={currentUnit.outcomes}
              onChange={(e) => setCurrentUnit({ ...currentUnit, outcomes: e.target.value })}
              fullWidth sx={inputSx} />
          </Box>
        </Box>

        {/* Footer */}
        <Box
          sx={{
            padding: "14px 24px",
            borderTop: "1.5px solid #e8e3f5",
            display: "flex",
            justifyContent: "flex-end",
            gap: "10px",
            background: "#fafafa",
            flexShrink: 0,
          }}
        >
          <Button
            onClick={handleModalClose}
            sx={{
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 700,
              textTransform: "none",
              color: "#64748b",
              borderRadius: "10px",
              transition: "all 0.2s ease",
              '&:hover': { background: "#ffebee", color: "#b71c1c" },
            }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={() => {
              const errors = {
                number: !currentUnit.number,
                name: !currentUnit.name,
              };
              if (errors.number || errors.name) {
                setUnitError(errors);
                if (showSnackbar) showSnackbar("Please fill in required fields.");
              } else {
                setUnitError({ number: false, name: false });
                handleOpenConfirmation(isEdit ? "edit" : "add");
              }
            }}
            sx={{
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 700,
              textTransform: "none",
              background: "#fff",
              color: "#673ab7",
              border: "2px solid #673ab7",
              borderRadius: "10px",
              padding: "7px 22px",
              transition: "all 0.2s ease",
              '&:hover': {
                background: "#673ab7",
                color: "#fff",
                boxShadow: "0 4px 16px rgba(103,58,183,0.25)",
                transform: "translateY(-1px)",
              },
            }}
          >
            {isEdit ? "Save Changes" : "Save Unit"}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default UnitModal;