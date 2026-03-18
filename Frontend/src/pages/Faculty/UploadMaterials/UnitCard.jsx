// src/components/UnitCard.jsx
import React from 'react';
import { Card, CardContent, Box, Typography, Button, IconButton } from '@mui/material';
import { CloudUploadRounded, InfoRounded, Edit, AutoDeleteRounded } from '@mui/icons-material';

const UnitCard = ({ unit, courseMappingId, handleUploadClick, uploadedUnits, getHasChanges, handleDetailsModalOpen, handleModalOpen, handleDeleteDialogOpen, navigate, lessonPlanCount }) => {
  const isUploaded = uploadedUnits.includes(unit.number) && getHasChanges(unit.number) !== "true";

  const statusClass =
    unit.status === "Approved" ? "approved" :
    unit.status === "Rejected" ? "rejected" : "pending";

  return (
    <Card className="uc-card" sx={{ borderRadius: "16px", height: "100%" }}>
      <CardContent
        sx={{
          background: 'linear-gradient(145deg, #ffffff 0%, #f9f7ff 100%)',
          borderRadius: "16px",
          padding: { xs: "16px", sm: "20px" },
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          height: "100%",
        }}
      >
        {/* Top row: Unit number + status + upload */}
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
          <Typography
            className="uc-unit-num"
            sx={{
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 700,
              fontSize: "0.78rem",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "#64748b",
            }}
          >
            Unit {unit.number}
          </Typography>

          <Box display="flex" alignItems="center" gap={1}>
            {/* Status badge */}
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontFamily: "'Outfit', sans-serif",
                fontWeight: 700,
                fontSize: "0.72rem",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                borderRadius: "20px",
                padding: "4px 12px",
                background:
                  unit.status === "Approved" ? "#e8f5e9" :
                  unit.status === "Rejected" ? "#ffebee" : "#fff8e1",
                color:
                  unit.status === "Approved" ? "#1b5e20" :
                  unit.status === "Rejected" ? "#b71c1c" : "#f57f17",
                '&::before': {
                  content: '""',
                  width: "7px",
                  height: "7px",
                  borderRadius: "50%",
                  background: "currentColor",
                  display: "inline-block",
                  ...(unit.status === "Pending" && {
                    animation: "pulse 1.5s ease infinite",
                  }),
                },
                '@keyframes pulse': {
                  '0%, 100%': { opacity: 1, transform: 'scale(1)' },
                  '50%': { opacity: 0.4, transform: 'scale(0.75)' },
                },
              }}
            >
              {unit.status}
            </Box>

            {/* Upload button */}
            <Button
              onClick={() => handleUploadClick(unit)}
              disabled={isUploaded}
              className={isUploaded ? "uc-upload-btn uploaded" : "uc-upload-btn active"}
              sx={{
                fontFamily: "'Outfit', sans-serif",
                fontWeight: 700,
                textTransform: "none",
                fontSize: "0.78rem",
                borderRadius: "8px",
                padding: "5px 12px",
                minWidth: 0,
                background: isUploaded ? "#f1f5f9 !important" : "#673ab7 !important",
                color: isUploaded ? "#94a3b8 !important" : "#fff !important",
                boxShadow: isUploaded ? "none" : "0 2px 8px rgba(103,58,183,0.25)",
                transition: "all 0.22s ease",
                '&:hover': {
                  background: isUploaded ? "#f1f5f9 !important" : "#4527a0 !important",
                  transform: isUploaded ? "none" : "translateY(-1px)",
                  boxShadow: isUploaded ? "none" : "0 4px 14px rgba(103,58,183,0.30) !important",
                },
                '&.Mui-disabled': {
                  background: "#f1f5f9 !important",
                  color: "#94a3b8 !important",
                  opacity: 1,
                },
              }}
            >
              <CloudUploadRounded sx={{ mr: 0.5, fontSize: "0.95rem" }} />
              {isUploaded ? "Uploaded" : "Upload"}
            </Button>
          </Box>
        </Box>

        {/* Unit name */}
        <Typography
          sx={{
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 800,
            color: "#673ab7",
            fontSize: { xs: "1rem", sm: "1.1rem" },
            lineHeight: 1.35,
            mt: 0.5,
            mb: 1,
            wordBreak: "break-word",
            minHeight: "50px",
          }}
        >
          {unit.name}
        </Typography>

        {/* Lesson plan count pill */}
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            background: "#ede7f6",
            color: "#673ab7",
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 700,
            fontSize: "0.78rem",
            borderRadius: "20px",
            padding: "3px 10px",
            width: "fit-content",
            mb: 1.5,
          }}
        >
          {lessonPlanCount > 0
            ? `${lessonPlanCount} Lesson Plan${lessonPlanCount > 1 ? "s" : ""}`
            : "No Lesson Plans yet"}
        </Box>

        {/* Timestamps */}
        <Typography
          variant="body2"
          sx={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "0.72rem",
            color: "#94a3b8",
            lineHeight: 1.8,
            mb: 2,
          }}
        >
          Created: {unit.created ? new Date(unit.created).toLocaleString() : "N/A"}
          <br />
          Updated: {unit.lastUpdated ? new Date(unit.lastUpdated).toLocaleString() : "N/A"}
        </Typography>

        {/* Action row */}
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Button
            variant="outlined"
            onClick={() =>
              navigate(`/lesson-plan/${unit.number}`, {
                state: { unitName: unit.name, courseMappingId },
              })
            }
            sx={{
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 700,
              textTransform: "none",
              color: "#673ab7",
              fontSize: { xs: "0.78rem", sm: "0.85rem" },
              border: "1.5px solid #673ab7",
              borderRadius: "8px",
              padding: { xs: "5px 10px", sm: "6px 14px" },
              background: "#fff",
              transition: "all 0.2s ease",
              "&:hover": {
                background: "#673ab7",
                color: "#fff",
                boxShadow: "0 4px 14px rgba(103,58,183,0.25)",
                transform: "translateY(-1px)",
              },
            }}
          >
            View Lesson Plan
          </Button>

          <Box display="flex" gap="6px">
            <IconButton
              onClick={() => handleDetailsModalOpen(unit)}
              sx={{
                color: '#673ab7',
                border: '1.5px solid #673ab7',
                borderRadius: "10px",
                width: 36, height: 36,
                background: '#fff',
                transition: "all 0.2s cubic-bezier(0.34,1.56,0.64,1)",
                '&:hover': {
                  background: '#673ab7',
                  color: '#fff',
                  transform: "scale(1.1) rotate(-5deg)",
                  boxShadow: "0 4px 12px rgba(103,58,183,0.25)",
                },
              }}
            >
              <InfoRounded sx={{ fontSize: "1.1rem" }} />
            </IconButton>

            <IconButton
              onClick={() => handleModalOpen(unit)}
              sx={{
                color: '#673ab7',
                border: '1.5px solid #673ab7',
                borderRadius: "10px",
                width: 36, height: 36,
                background: '#fff',
                transition: "all 0.2s cubic-bezier(0.34,1.56,0.64,1)",
                '&:hover': {
                  background: '#673ab7',
                  color: '#fff',
                  transform: "scale(1.1) rotate(-5deg)",
                  boxShadow: "0 4px 12px rgba(103,58,183,0.25)",
                },
              }}
            >
              <Edit sx={{ fontSize: "1.1rem" }} />
            </IconButton>

            <IconButton
              onClick={() => handleDeleteDialogOpen(unit)}
              sx={{
                color: '#b71c1c',
                border: '1.5px solid #b71c1c',
                borderRadius: "10px",
                width: 36, height: 36,
                background: '#fff',
                transition: "all 0.2s cubic-bezier(0.34,1.56,0.64,1)",
                '&:hover': {
                  background: '#b71c1c',
                  color: '#fff',
                  transform: "scale(1.1) rotate(-5deg)",
                  boxShadow: "0 4px 12px rgba(183,28,28,0.25)",
                },
              }}
            >
              <AutoDeleteRounded sx={{ fontSize: "1.1rem" }} />
            </IconButton>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default UnitCard;
