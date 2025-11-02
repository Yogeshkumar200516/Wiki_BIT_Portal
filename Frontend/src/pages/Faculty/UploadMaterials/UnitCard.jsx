// src/components/UnitCard.jsx
import React from 'react';
import { Card, CardContent, Box, Typography, Button, IconButton } from '@mui/material';
import { CloudUploadRounded, InfoRounded, Edit, AutoDeleteRounded } from '@mui/icons-material';

const UnitCard = ({ unit, handleUploadClick, uploadedUnits, handleDetailsModalOpen, handleModalOpen, handleDeleteDialogOpen, navigate, lessonPlanCount }) => {
  return (
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
                justifyContent: 'center',
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

        <Typography
          variant="h6"
          fontWeight="bold"
          color="#673ab7"
          sx={{
            fontWeight: 900,
            whiteSpace: "normal",
            overflow: "hidden",
            maxWidth: "100%",
            textAlign: 'left',
            color: "#673ab7",
            textOverflow: "ellipsis",
            fontSize: { xs: '1.1rem', sm: '1.2rem' },
            mt: "20px",
            wordWrap: "break-word",
            overflowWrap: "break-word",
            display: "block",
            height: "60px",
            lineHeight: "1.5rem",
          }}
        >
          {unit.name}
        </Typography>

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
          Created: {unit.created ? new Date(unit.created).toLocaleString() : "N/A"}
          <br />
          Last updated: {unit.lastUpdated ? new Date(unit.lastUpdated).toLocaleString() : "N/A"}
        </Typography>

        <Box mt={2} display="flex" justifyContent="space-between" alignItems="center">
          <Button
            variant="outlined"
            onClick={() => navigate(`/lesson-plan/${unit.number}`, { state: { unitName: unit.name } })}
            sx={{
              fontWeight: "bold",
              textTransform: "none",
              color: "#673ab7",
              fontSize: { xs: '14px', sm: '16px' },
              border: "1px solid #673ab7",
              borderRadius: "8px",
              padding: { xs: '5px 10px', sm: '6px 16px' },
              backgroundColor: '#fff',
              "&:hover": {
                backgroundColor: "#673ab7",
                color: "#fff",
              },
            }}
          >
            View Lesson Plan
          </Button>
          <Box sx={{ display: 'flex' }}>
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
              sx={{ color: '#673ab7', zIndex: 1, ml: { xs: '5px', sm: '10px' }, fontSize: { xs: '0.6rem', sm: '1rem' }, border: '2px solid #673ab7', backgroundColor: '#fff', '&:hover': { backgroundColor: '#673ab7', color: '#fff' } }}
            >
              <Edit />
            </IconButton>
            <IconButton
              color="error"
              onClick={() => handleDeleteDialogOpen(unit)}
              sx={{ color: '#b71c1c', ml: { xs: '5px', sm: '10px' }, zIndex: 1, border: '2px solid #b71c1c', backgroundColor: '#fff', '&:hover': { backgroundColor: '#b71c1c', color: '#fff' } }}
            >
              <AutoDeleteRounded />
            </IconButton>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default UnitCard;
