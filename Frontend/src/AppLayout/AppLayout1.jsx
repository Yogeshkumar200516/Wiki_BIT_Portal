import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar/Navbar';
import Student from '../pages/Student/StudentDashboard/Student';
import Downloads from '../pages/Student/Downloads/Downloads';
import Materials from '../pages/Student/LectureMaterials/Materials';
import Faculty from '../pages/Faculty/FacultyDashboard/Faculty';
import Notifications from '../pages/Faculty/Notifications/Notifications';
import Upload from '../pages/Faculty/UploadMaterials/Upload';
import Approval from '../pages/Faculty/ActivityApproval/Approval';
import Status from '../pages/Faculty/ActivityStatus/Status';
import History from '../pages/Faculty/History/History';
import Admin from '../pages/Admin/AdminDashboard/Admin';
import FacultyAssign from '../pages/Admin/FacultyAssignment/FacultyAssign';
import LessonPlan from '../pages/Faculty/UploadMaterials/LessonPlan';
import Login from '../components/LoginPage/Login';

function AppLayout() {
    const navigate = useNavigate();

    // State for drawer
    const [open, setOpen] = useState(true); // Drawer open state
    const [hidden, setHidden] = useState(false); // Drawer hidden state
    const [isLoggedIn, setIsLoggedIn] = useState(false); // User login state
    const [role, setRole] = useState(null); // User role (e.g., 'student', 'faculty', 'admin')

    // Handle responsive drawer state based on window size
    const handleResize = () => {
        if (window.innerWidth > 1200) {
            setOpen(true);
            setHidden(false);
        } else if (window.innerWidth > 500 && window.innerWidth <= 1200) {
            setOpen(false);
            setHidden(false);
        } else {
            setOpen(false);
            setHidden(true);
        }
    };

    useEffect(() => {
        handleResize(); // Initial setup
        window.addEventListener('resize', handleResize); // Listen for window resize
        return () => window.removeEventListener('resize', handleResize); // Cleanup
    }, []);

    const getPageMarginLeft = () => {
        if (window.innerWidth < 500) return '0px';
        if (hidden) return '0px';
        if (open) return '240px';
        return '65px';
    };

    // Handle login action
    const handleLogin = () => {
        // Simulate fetching user role (replace with actual logic if needed)
        const userRole = 'faculty'; // Example: set role dynamically based on login
        setRole(userRole); // Set the role
        setIsLoggedIn(true); // Set login state to true

        // Navigate to the corresponding dashboard
        if (userRole === 'student') {
            navigate('/');
        } else if (userRole === 'faculty') {
            navigate('/');
        } else if (userRole === 'admin') {
            navigate('/');
        }
    };

    return (
        <div className="app-layout-page">
            {/* Show Login component if user is not logged in */}
            {!isLoggedIn ? (
                <Login onLogin={handleLogin} />
            ) : (
                <>
                    {/* Navbar for authenticated users */}
                    <Navbar 
                        role={role}
                        isDrawerOpen={open}
                        setDrawerOpen={setOpen}
                        isDrawerHidden={hidden}
                        setDrawerHidden={setHidden}
                    />

                    {/* Routed pages */}
                    <div 
                        className="routed-pages" 
                        style={{ 
                            marginLeft: getPageMarginLeft(), 
                            marginTop: '60px', 
                            transition: 'margin-left 0.3s ease-in-out',
                        }}
                    >
                        <Routes>
                            {/* Role-based routes */}
                            {role === 'student' && (
                                <>
                                    <Route path="/" element={<Student />} />
                                    <Route path="/downloads" element={<Downloads />} />
                                    <Route path="/lecture-materials" element={<Materials />} />
                                </>
                            )}

                            {role === 'faculty' && (
                                <>
                                    <Route path="/" element={<Faculty />} />
                                    <Route path="/notifications" element={<Notifications />} />
                                    <Route path="/upload-materials" element={<Upload />} />
                                    <Route path="/activity-approval" element={<Approval />} />
                                    <Route path="/activity-status" element={<Status />} />
                                    <Route path="/history" element={<History />} />
                                    <Route path="/lesson-plan/:unitNumber" element={<LessonPlan />} />
                                </>
                            )}

                            {role === 'admin' && (
                                <>
                                    <Route path="/" element={<Admin />} />
                                    <Route path="/faculty-assignment" element={<FacultyAssign />} />
                                </>
                            )}

                            {/* Catch-all route */}
                            <Route path="*" element={null} />
                        </Routes>
                    </div>
                </>
            )}
        </div>
    );
}

export default AppLayout;
