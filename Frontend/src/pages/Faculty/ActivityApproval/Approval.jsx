import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  IconButton,
  Modal,
  Backdrop,
  Fade,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";

const Approval = () => {
  const [units, setUnits] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetch(
        "/src/components/DummyData/ApprovalData.json"
      ).then((res) => res.json());
      setUnits(data);
    };

    fetchData();
  }, []);

  const handleOpen = (unit) => {
    setSelectedUnit(unit);
    setOpen(true);
  };

  const handleClose = () => {
    setSelectedUnit(null);
    setOpen(false);
  };

  return (
    <Box
      sx={{
        textAlign: "center",
        padding: { xs: 2, sm: 3 },
        backgroundColor: "#f5f5f5",
        minHeight: "calc(100vh - 60px)",
      }}
    >
      <Typography
        variant="h5"
        align="center"
        sx={{
          mb: 3,
          fontWeight: 600,
          color: "#2d3a56",
          fontSize: { xs: "1rem", sm: "2rem" },
        }}
      >
        Approval of Units for{" "}
        <span style={{ color: "#673ab7" }}>Strength of Materials</span> -{" "}
        <span style={{ color: "#673ab7" }}>22ME402</span>
      </Typography>

      {units.length === 0 ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "60vh",
          }}
        >
          <InsertDriveFileOutlinedIcon
            sx={{ fontSize: 60, color: "#b0bec5", mb: 2 }}
          />
          <Typography variant="h6" color="textSecondary">
            No approval requests available
          </Typography>
        </Box>
      ) : (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" },
            gap: 3,
          }}
        >
          {units.map((unit) => (
            <Card
              key={unit.id}
              sx={{
                boxShadow: 3,
                borderRadius: 2,
                backgroundColor: "#fff",
                textAlign: "left",
              }}
            >
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, color: "#2d3a56" }}>
                  Unit {unit.number}: {unit.name}
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  <strong>Uploaded By:</strong> {unit.uploadedBy}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  <strong>Upload Type:</strong> {unit.uploadType}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  <strong>Approval For:</strong> {unit.approvalFor}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  <strong>Updated At:</strong> {unit.updatedAt}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  <strong>No. of Lesson Plans:</strong> {unit.noOfLessonPlans}
                </Typography>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mt: 2,
                  }}
                >
                  <IconButton color="primary" onClick={() => handleOpen(unit)}>
                    <InfoIcon />
                  </IconButton>
                  <Button variant="contained" color="primary">
                    View Lesson Plans
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* Modal for displaying full details */}
      <Modal
  open={open}
  onClose={handleClose}
  closeAfterTransition
  BackdropComponent={Backdrop}
  BackdropProps={{
    timeout: 500,
  }}
>
  <Fade in={open}>
    <Box
      sx={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: "90%",
        maxWidth: 600,
        bgcolor: "background.paper",
        borderRadius: 2,
        boxShadow: 24,
        display: "flex",
        flexDirection: "column",
        height: "80vh", // Set a height to enable scrolling for content
        outline: "none",
      }}
    >
      {/* Fixed Header */}
      <Box
        sx={{
          px: 3,
          py: 2,
          borderBottom: "1px solid #ddd",
          backgroundColor: "#f5f5f5",
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Unit {selectedUnit?.number}: {selectedUnit?.name}
        </Typography>
      </Box>

      {/* Scrollable Content */}
      <Box
        sx={{
          p: 3,
          overflowY: "auto",
          flex: 1,
          "&::-webkit-scrollbar": {
            display: "none",
          },
          msOverflowStyle: "none",
          scrollbarWidth: "none",
        }}
      >
        {selectedUnit && (
          <>
            <Typography variant="body1" sx={{ mb: 2 }}>
              <strong>Uploaded By:</strong> {selectedUnit.uploadedBy}
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              <strong>Upload Type:</strong> {selectedUnit.uploadType}
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              <strong>Approval For:</strong> {selectedUnit.approvalFor}
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              <strong>Introduction:</strong>
              {typeof selectedUnit.introduction === "string" ? (
                <Box component="ul" sx={{ pl: 3 }}>
                  {selectedUnit.introduction.split(". ").map((point, idx) => (
                    <li key={idx}>{point}</li>
                  ))}
                </Box>
              ) : (
                "No introduction available."
              )}
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              <strong>Objectives:</strong>
              {typeof selectedUnit.objectives === "string" ? (
                <Box component="ul" sx={{ pl: 3 }}>
                  {selectedUnit.objectives.split(". ").map((point, idx) => (
                    <li key={idx}>{point}</li>
                  ))}
                </Box>
              ) : (
                "No objectives available."
              )}
            </Typography>
          </>
        )}
      </Box>

      {/* Footer with Buttons */}
      <Box
        sx={{
          px: 3,
          py: 2,
          borderTop: "1px solid #ddd",
          display: "flex",
          justifyContent: "flex-end",
          gap: 2,
          backgroundColor: "#f5f5f5",
        }}
      >
        <Button variant="contained" color="primary" onClick={() => alert("Approved!")}>
          Approve
        </Button>
        <Button variant="outlined" color="error" onClick={() => alert("Rejected!")}>
          Reject
        </Button>
        <Button variant="text" color="inherit" onClick={handleClose}>
          Close
        </Button>
      </Box>
    </Box>
  </Fade>
</Modal>

    </Box>
  );
};

export default Approval;
