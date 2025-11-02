import React from "react";
import { jsPDF } from "jspdf";
import DownloadIcon from "@mui/icons-material/Download";
import { Button } from "@mui/material";

// Component to handle PDF download
const UnitInfo = ({ unitDetails }) => {
  const handleDownloadPDF = () => {
    const doc = new jsPDF();

    // Set document title and general style
    doc.setFont("helvetica");
    doc.setFontSize(12);
    const marginLeft = 10; // left margin for all content
    const pageHeight = doc.internal.pageSize.height;
    let yPosition = 20; // Initial y position for the first line of content

    // Title and General Information (Header)
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(`Unit Number: ${unitDetails?.number || "N/A"}`, marginLeft, yPosition);
    yPosition += 10;
    doc.text(`Unit Name: ${unitDetails?.name || "N/A"}`, marginLeft, yPosition);
    yPosition += 10;
    doc.text(`No. of Lesson Plans: ${unitDetails?.lessonPlanCount || 0}`, marginLeft, yPosition);
    yPosition += 10;
    doc.text(`Last Updated: ${unitDetails?.lastUpdated || "N/A"}`, marginLeft, yPosition);

    yPosition += 20; // extra space before the sections

    // Add a section separator line
    doc.setFontSize(10);
    doc.text("------------------------------------------------------", marginLeft, yPosition);
    yPosition += 10;

    // Introduction Section
    doc.setFont("helvetica", "bold");
    doc.text("1. Introduction", marginLeft, yPosition);
    yPosition += 10;
    doc.setFont("helvetica", "normal");
    const introductionText = unitDetails?.introduction || "N/A";
    addMultilineText(doc, introductionText, marginLeft, yPosition);
    yPosition += 20;

    // Summary Section
    doc.setFont("helvetica", "bold");
    doc.text("2. Summary", marginLeft, yPosition);
    yPosition += 10;
    doc.setFont("helvetica", "normal");
    const summaryText = unitDetails?.summary || "N/A";
    addMultilineText(doc, summaryText, marginLeft, yPosition);
    yPosition += 20;

    // Objectives Section
    doc.setFont("helvetica", "bold");
    doc.text("3. Objectives", marginLeft, yPosition);
    yPosition += 10;
    doc.setFont("helvetica", "normal");
    const objectivesText = unitDetails?.objectives || "N/A";
    addMultilineText(doc, objectivesText, marginLeft, yPosition);
    yPosition += 20;

    // Outcomes Section
    doc.setFont("helvetica", "bold");
    doc.text("4. Outcomes", marginLeft, yPosition);
    yPosition += 10;
    doc.setFont("helvetica", "normal");
    const outcomesText = unitDetails?.outcomes || "N/A";
    addMultilineText(doc, outcomesText, marginLeft, yPosition);
    yPosition += 20;

    // Mind Map Section
    if (unitDetails?.mindMap) {
      doc.setFont("helvetica", "bold");
      doc.text("5. Mind Map", marginLeft, yPosition);
      yPosition += 10;
      if (unitDetails?.mindMap?.type?.includes("image/")) {
        // Add image to the PDF
        const imageURL = URL.createObjectURL(unitDetails.mindMap);  // Ensure the mind map is properly passed as an image
        doc.addImage(imageURL, "PNG", marginLeft, yPosition, 180, 160); // Image in PNG format
        yPosition += 170; // Adjusting for image height
      } else if (unitDetails?.mindMap?.type?.includes("pdf")) {
        // Add clickable link for PDF
        const mindMapPdfLink = unitDetails?.mindMap?.link || "#"; // Ensure there is a link to the mind map PDF
        doc.textWithLink("Mind Map: View in PDF", marginLeft, yPosition, { url: mindMapPdfLink });
        yPosition += 10;
      }
    }

    // References Section
    doc.setFont("helvetica", "bold");
    doc.text("6. References", marginLeft, yPosition);
    yPosition += 10;
    doc.setFont("helvetica", "normal");
    const referencesText = unitDetails?.references || "N/A";
    addMultilineText(doc, referencesText, marginLeft, yPosition);

    // Save the PDF
    doc.save("unit_details.pdf");
  };

  // Helper function to add multiline text
  const addMultilineText = (doc, text, marginLeft, yPosition) => {
    const pageHeight = doc.internal.pageSize.height;
    const lineHeight = 10;
    const pageWidth = doc.internal.pageSize.width;
    const maxWidth = pageWidth - marginLeft * 2;

    let textLines = doc.splitTextToSize(text, maxWidth);
    for (let i = 0; i < textLines.length; i++) {
      if (yPosition + lineHeight > pageHeight - 20) {
        doc.addPage();
        yPosition = 20; // Reset the yPosition to start at the top of the new page
      }
      doc.text(textLines[i], marginLeft, yPosition);
      yPosition += lineHeight;
    }
  };

  return (
    <Button
      variant="contained"
      onClick={handleDownloadPDF}
      sx={{
        textTransform: "none",
        fontWeight: "bold",
        mr: 2,
        mt: 2,
        backgroundColor: "#673ab7",
        "&:hover": { backgroundColor: "#512da8" },
      }}
    >
      <DownloadIcon sx={{ mr: 1 }} />
      Download PDF
    </Button>
  );
};

export default UnitInfo;
