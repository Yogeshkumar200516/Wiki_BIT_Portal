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
    
    // State for authentication & user role
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [role, setRole] = useState(null);
    
    // State for sidebar drawer
    const [open, setOpen] = useState(true);
    const [hidden, setHidden] = useState(false);

    useEffect(() => {
        // Check if the user is logged in (from localStorage)
        const user = localStorage.getItem('user');
        if (user) {
            const parsedUser = JSON.parse(user);
            setIsLoggedIn(true);
            setRole(parsedUser.role);
        } else {
            setIsLoggedIn(false);
            setRole(null);
        }
    }, []);

    // Function to handle logout
    const handleLogout = () => {
        localStorage.removeItem('user'); // Clear user session
        setIsLoggedIn(false);
        setRole(null);
        navigate('/'); // Redirect to login page
    };

    // Handle sidebar state based on screen size
    const handleResize = () => {
        if (window.innerWidth > 1200) {
            setOpen(true);
            setHidden(false);
        } else if (window.innerWidth > 500) {
            setOpen(false);
            setHidden(false);
        } else {
            setOpen(false);
            setHidden(true);
        }
    };

    useEffect(() => {
        handleResize(); // Initial setup
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Calculate left margin based on drawer state
    const getPageMarginLeft = () => {
        if (window.innerWidth < 500) return '0px';
        if (hidden) return '0px';
        return open ? '240px' : '65px';
    };

    // If user is NOT logged in, show the login page
    if (!isLoggedIn) {
        return <Login onLogin={(userData) => { setRole(userData.role); setIsLoggedIn(true); }} />;
    }

    return (
        <div className="app-layout-page">
            {/* Navbar */}
            <Navbar
                role={role}
                isDrawerOpen={open}
                setDrawerOpen={setOpen}
                isDrawerHidden={hidden}
                setDrawerHidden={setHidden}
                onLogout={handleLogout} // Logout handler
            />

            {/* Routed Pages (Based on Role) */}
            <div
                className="routed-pages"
                style={{
                    marginLeft: getPageMarginLeft(),
                    marginTop: '60px',
                    transition: 'margin-left 0.3s ease-in-out',
                }}
            >
                <Routes>
                    {/* Student Routes */}
                    {role === 'Student' && (
                        <>
                            <Route path="/" element={<Student />} />
                            <Route path="/downloads" element={<Downloads />} />
                            <Route path="/lecture-materials" element={<Materials />} />
                        </>
                    )}

                    {/* Faculty Routes */}
                    {role === 'Faculty' && (
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

                    {/* Admin Routes */}
                    {role === 'Admin' && (
                        <>
                            <Route path="/" element={<Admin />} />
                            <Route path="/faculty-assignment" element={<FacultyAssign />} />
                        </>
                    )}

                    {/* Catch-all route (Prevents navigation issues) */}
                    <Route path="*" element={null} />
                </Routes>
            </div>
        </div>
    );
}

export default AppLayout;
