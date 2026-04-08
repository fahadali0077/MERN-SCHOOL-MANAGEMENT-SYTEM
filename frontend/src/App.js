import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Homepage from './pages/Homepage';
import AdminDashboard from './pages/admin/AdminDashboard';
import StudentDashboard from './pages/student/StudentDashboard';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import LoginPage from './pages/LoginPage';
import ChooseUser from './pages/ChooseUser';
import AdminRegisterPage from './pages/admin/AdminRegisterPage';
import ErrorBoundary from './components/ErrorBoundary';
import AboutPage from './pages/homepage/AboutPage';
import CoursesPage from './pages/homepage/CoursesPage';
import TeachersPage from './pages/homepage/TeachersPage';
import ContactPage from './pages/homepage/ContactPage';
import GalleryPage from './pages/homepage/GalleryPage';

const App = () => {
    const { currentRole } = useSelector(state => state.user);

    return (
        <Router>
            <Routes>
                {currentRole === null ? (
                    <>
                        <Route path="/" element={<Homepage />} />
                        <Route path="/about"    element={<AboutPage />} />
                        <Route path="/courses"  element={<CoursesPage />} />
                        <Route path="/teachers" element={<TeachersPage />} />
                        <Route path="/contact"  element={<ContactPage />} />
                        <Route path="/gallery"  element={<GalleryPage />} />

                        <Route path="/choose"         element={<ChooseUser visitor="normal" />} />
                        <Route path="/chooseasguest"  element={<ChooseUser visitor="guest" />} />
                        <Route path="/Adminlogin"     element={<LoginPage role="Admin" />} />
                        <Route path="/Studentlogin"   element={<LoginPage role="Student" />} />
                        <Route path="/Teacherlogin"   element={<LoginPage role="Teacher" />} />
                        <Route path="/AdminRegister"  element={<AdminRegisterPage />} />

                        <Route path="*" element={<Navigate to="/" />} />
                    </>
                ) : currentRole === 'Admin' ? (
                    // FIX F-1: Wrap dashboards in ErrorBoundary
                    <Route path="*" element={
                        <ErrorBoundary>
                            <AdminDashboard />
                        </ErrorBoundary>
                    } />
                ) : currentRole === 'Student' ? (
                    <Route path="*" element={
                        <ErrorBoundary>
                            <StudentDashboard />
                        </ErrorBoundary>
                    } />
                ) : (
                    <Route path="*" element={
                        <ErrorBoundary>
                            <TeacherDashboard />
                        </ErrorBoundary>
                    } />
                )}
            </Routes>
        </Router>
    );
};

export default App;
