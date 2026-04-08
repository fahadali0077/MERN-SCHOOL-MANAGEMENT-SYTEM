import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';

import Logout from '../Logout';
import StudentHomePage from './StudentHomePage';
import StudentProfile from './StudentProfile';
import StudentSubjects from './StudentSubjects';
import ViewStdAttendance from './ViewStdAttendance';
import StudentComplain from './StudentComplain';

const StudentDashboard = () => (
  <DashboardLayout>
    <Routes>
      <Route path="/"                      element={<StudentHomePage />} />
      <Route path="*"                      element={<Navigate to="/Student/dashboard" />} />
      <Route path="/Student/dashboard"     element={<StudentHomePage />} />
      <Route path="/Student/profile"       element={<StudentProfile />} />
      <Route path="/Student/subjects"      element={<StudentSubjects />} />
      <Route path="/Student/attendance"    element={<ViewStdAttendance />} />
      <Route path="/Student/complain"      element={<StudentComplain />} />
      <Route path="/logout"                element={<Logout />} />
    </Routes>
  </DashboardLayout>
);

export default StudentDashboard;
