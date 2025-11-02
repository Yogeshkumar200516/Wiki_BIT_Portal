import React from "react";
import { useParams } from "react-router-dom";
import './Materials.css';

function Materials() {
    const { courseCode } = useParams();

    return (
        <div className="materials-container">
            <h2>Lecture Materials for {courseCode}</h2>
            {/* Replace the content below with dynamic data or UI */}
            <p>Here, you can display the lecture materials for the course: {courseCode}.</p>
        </div>
    );
}

export default Materials;
