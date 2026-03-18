// src/components/UnitDetailsModal.jsx
import React from 'react';
import { Modal, Box, Typography, Button } from '@mui/material';

const sections = [
  { key: 'lessonPlanCount', label: '1. Lesson Plans', render: (v) => `${v} lesson plan${v !== 1 ? 's' : ''} in this unit` },
  { key: 'timestamps', label: '2. Timestamps', render: (_, d) => (
    <Box>
      <Typography sx={{ color: '#64748b', fontSize: '0.88rem', fontFamily: "'Outfit', sans-serif" }}>
        <strong style={{ color: '#475569' }}>Created:</strong>{' '}
        {d?.created ? new Date(d.created).toLocaleString() : 'N/A'}
      </Typography>
      <Typography sx={{ color: '#64748b', fontSize: '0.88rem', mt: 0.5, fontFamily: "'Outfit', sans-serif" }}>
        <strong style={{ color: '#475569' }}>Last Updated:</strong>{' '}
        {d?.lastUpdated ? new Date(d.lastUpdated).toLocaleString() : 'N/A'}
      </Typography>
    </Box>
  )},
  { key: 'introduction', label: '3. Introduction' },
  { key: 'summary', label: '4. Summary' },
  { key: 'objectives', label: '5. Objectives' },
  { key: 'outcomes', label: '6. Outcomes' },
  { key: 'references', label: '7. References' },
];

const UnitDetailsModal = ({ open, handleClose, unitDetails }) => {
  return (
    <Modal open={open} onClose={handleClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: { xs: "95%", sm: "80%", md: "70%" },
          maxWidth: "700px",
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
            variant="h5"
            sx={{
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 800,
              color: "#673ab7",
              fontSize: { xs: "1.1rem", sm: "1.35rem" },
            }}
          >
            Unit {unitDetails?.number || "N/A"}
            <span style={{ color: "#94a3b8", fontWeight: 500, margin: "0 8px" }}>—</span>
            <span style={{ color: "#1a1036" }}>{unitDetails?.name || "N/A"}</span>
          </Typography>
        </Box>

        {/* Scrollable body */}
        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            padding: "20px 24px",
            scrollbarWidth: "none",
            '&::-webkit-scrollbar': { display: 'none' },
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          {/* Lesson plan count */}
          <Box sx={sectionStyle}>
            <Typography sx={sectionTitleStyle}>1. Lesson Plans</Typography>
            <Typography sx={bodyTextStyle}>
              {unitDetails?.lessonPlanCount || 0} lesson plan{unitDetails?.lessonPlanCount !== 1 ? 's' : ''} in this unit
            </Typography>
          </Box>

          {/* Timestamps */}
          <Box sx={sectionStyle}>
            <Typography sx={sectionTitleStyle}>2. Timestamps</Typography>
            <Typography sx={bodyTextStyle}>
              <strong style={{ color: '#475569' }}>Created:</strong>{" "}
              {unitDetails?.created ? new Date(unitDetails.created).toLocaleString() : "N/A"}
            </Typography>
            <Typography sx={{ ...bodyTextStyle, mt: 0.5 }}>
              <strong style={{ color: '#475569' }}>Last Updated:</strong>{" "}
              {unitDetails?.lastUpdated ? new Date(unitDetails.lastUpdated).toLocaleString() : "N/A"}
            </Typography>
          </Box>

          {/* Introduction */}
          <Box sx={sectionStyle}>
            <Typography sx={sectionTitleStyle}>3. Introduction</Typography>
            <Typography sx={bodyTextStyle}>{unitDetails?.introduction || "N/A"}</Typography>
          </Box>

          {/* Summary */}
          <Box sx={sectionStyle}>
            <Typography sx={sectionTitleStyle}>4. Summary</Typography>
            <Typography sx={bodyTextStyle}>{unitDetails?.summary || "N/A"}</Typography>
          </Box>

          {/* Objectives */}
          <Box sx={sectionStyle}>
            <Typography sx={sectionTitleStyle}>5. Objectives</Typography>
            <Typography sx={bodyTextStyle}>{unitDetails?.objectives || "N/A"}</Typography>
          </Box>

          {/* Outcomes */}
          <Box sx={sectionStyle}>
            <Typography sx={sectionTitleStyle}>6. Outcomes</Typography>
            <Typography sx={bodyTextStyle}>{unitDetails?.outcomes || "N/A"}</Typography>
          </Box>

          {/* References */}
          <Box sx={sectionStyle}>
            <Typography sx={sectionTitleStyle}>7. References</Typography>
            <Typography sx={bodyTextStyle}>{unitDetails?.references || "N/A"}</Typography>
          </Box>
        </Box>

        {/* Footer */}
        <Box
          sx={{
            padding: "14px 24px",
            borderTop: "1.5px solid #e8e3f5",
            display: "flex",
            justifyContent: "flex-end",
            background: "#fafafa",
            flexShrink: 0,
          }}
        >
          <Button
            onClick={handleClose}
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
              },
            }}
          >
            Close
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

const sectionStyle = {
  border: "1.5px solid #e8e3f5",
  borderRadius: "12px",
  padding: "14px 16px",
  background: "linear-gradient(135deg, #fdfcff 0%, #f7f4ff 100%)",
  transition: "box-shadow 0.2s ease, transform 0.2s ease",
  cursor: "default",
  '&:hover': {
    boxShadow: "0 4px 16px rgba(103,58,183,0.12)",
    transform: "translateX(3px)",
  },
};

const sectionTitleStyle = {
  fontFamily: "'Outfit', sans-serif",
  fontWeight: 800,
  color: "#673ab7",
  fontSize: "0.78rem",
  textTransform: "uppercase",
  letterSpacing: "0.07em",
  marginBottom: "8px",
  display: "flex",
  alignItems: "center",
  gap: "6px",
  '&::before': {
    content: '""',
    width: "4px",
    height: "14px",
    background: "#673ab7",
    borderRadius: "2px",
    display: "inline-block",
  },
};

const bodyTextStyle = {
  fontFamily: "'Outfit', sans-serif",
  fontSize: "0.88rem",
  color: "#475569",
  whiteSpace: "pre-wrap",
  wordBreak: "break-word",
  lineHeight: 1.65,
};

export default UnitDetailsModal;