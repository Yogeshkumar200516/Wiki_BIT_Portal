// src/components/UnitDetailsModal.jsx
import React from 'react';
import { Modal, Box, Typography, Button } from '@mui/material';

const UnitDetailsModal = ({ open, handleClose, unitDetails }) => {
  return (
    <Modal
      open={open}
      onClose={handleClose}
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
          p: { xs: 0, sm: 2 },
          overflow: "hidden",
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
            overflowY: "scroll",
            p: 2,
            display: "flex",
            flexDirection: "column",
            gap: 3,
            maxHeight: "70vh",
            '&::-webkit-scrollbar': {
              display: 'none',
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

          {/* Created At and Last Updated */}
          <Box sx={{ border: "1px solid #e0e0e0", borderRadius: 2, p: 2, bgcolor: "#f9f9f9" }}>
            <Typography variant="h6" color="#673ab7" fontWeight="bold" mb={1}>
              2. Timestamps
            </Typography>
            <Typography variant="body1" sx={{ mb: 1, color: '#757575' }}>
              <strong>Created At:</strong>{" "}
              {unitDetails?.created ? new Date(unitDetails.created).toLocaleString() : "N/A"}
            </Typography>
            <Typography variant="body1" sx={{ mb: 1, color: '#757575' }}>
              <strong>Last Updated:</strong>{" "}
              {unitDetails?.lastUpdated ? new Date(unitDetails.lastUpdated).toLocaleString() : "N/A"}
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

        {/* Close Button */}
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
          <Button
            variant="contained"
            onClick={handleClose}
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
  );
};

export default UnitDetailsModal;
