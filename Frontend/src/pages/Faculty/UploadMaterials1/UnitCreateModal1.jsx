// src/components/UnitModal.jsx
import React from 'react';
import { Modal, Box, Typography, Button, FormControl, InputLabel, Select, MenuItem, TextField } from '@mui/material';

const UnitModal = ({ 
  modalOpen, 
  handleModalClose, 
  isEdit, 
  currentUnit, 
  setCurrentUnit, 
  unitError, 
  setUnitError, 
  showSnackbar, 
  handleOpenConfirmation 
}) => {

  return (
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
            "&::-webkit-scrollbar": { display: "none" },
            msOverflowStyle: "none", 
            scrollbarWidth: "none", 
          }}
        >
          {/* Unit Number and Name */}
          <Box display="flex" flexDirection={{ xs: "column", sm: "row" }} gap={2} sx={{ mb: 3 }}>
            <FormControl fullWidth>
              <InputLabel sx={{ color: "#616161", fontWeight: "bold", backgroundColor: "white", padding: "0 5px" }}>
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
  );
};

export default UnitModal;
