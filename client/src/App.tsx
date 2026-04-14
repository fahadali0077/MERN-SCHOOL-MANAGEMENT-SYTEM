import React, { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './store';
import { useGetMeQuery } from './store/api/endpoints';
import { setCredentials, setLoading } from './store/slices/authSlice';
import { logout } from './store/slices/authSlice';
import { useDispatch, useSelector } from 'react-redux';
import { selectIsAuthenticated, selectUserRole } from './store/slices/authSlice';
import { RootState } from './store';
import { useSocket } from './hooks/useSocket';
import './styles/globals.css';

const L = (fn: () => Promise<any>) => lazy(fn);

const LandingPage         = L(() => import('./pages/Landing'));
const LoginPage           = L(() => import('./pages/auth/Login'));
const RegisterPage        = L(() => import('./pages/auth/Register'));
const ForgotPasswordPage  = L(() => import('./pages/auth/ForgotPassword'));
const ResetPasswordPage   = L(() => import('./pages/auth/ResetPassword'));
const DashboardLayout     = L(() => import('./components/layout/DashboardLayout'));
const AdminDashboard      = L(() => import('./pages/dashboard/AdminDashboard'));
const SuperAdminDashboard = L(() => import('./pages/dashboard/SuperAdminDashboard'));
const TeacherDashboard    = L(() => import('./pages/dashboard/TeacherDashboard'));
const StudentDashboard    = L(() => import('./pages/dashboard/StudentDashboard'));
const StudentsPage        = L(() => import('./pages/students/StudentsPage'));
const StudentDetail       = L(() => import('./pages/students/StudentDetail'));
const AddStudent          = L(() => import('./pages/students/AddStudent'));
const TeachersPage        = L(() => import('./pages/admin/TeachersPage'));
const ClassesPage         = L(() => import('./pages/admin/ClassesPage'));
const AttendancePage      = L(() => import('./pages/attendance/AttendancePage'));
const AttendanceReport    = L(() => import('./pages/attendance/AttendanceReport'));
const ExamsPage           = L(() => import('./pages/marks/ExamsPage'));
const MarksEntry          = L(() => import('./pages/marks/MarksEntry'));
const ReportCard          = L(() => import('./pages/marks/ReportCard'));
const FeesPage            = L(() => import('./pages/fees/FeesPage'));
const InvoicesPage        = L(() => import('./pages/fees/InvoicesPage'));
const NoticesPage         = L(() => import('./pages/notices/NoticesPage'));
const AssignmentsPage     = L(() => import('./pages/assignments/AssignmentsPage'));
const MessagesPage        = L(() => import('./pages/messages/MessagesPage'));
const ProfilePage         = L(() => import('./pages/ProfilePage'));
const SettingsPage        = L(() => import('./pages/SettingsPage'));

const PageLoader = () => (
  <div className="min-h-screen bg-bg-primary flex items-center justify-center">
    <div className="relative w-12 h-12">
      <div className="absolute inset-0 rounded-full border-2 border-accent/20" />
      <div className="absolute inset-0 rounded-full border-2 border-accent border-t-transparent animate-spin" />
    </div>
  </div>
);

const AuthInitializer = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useDispatch();
  const { data, error, isLoading } = useGetMeQuery();
  useSocket();
  useEffect(() => {
    if (data?.data?.user) dispatch(setCredentials({ user: data.data.user, accessToken: data.data.accessToken || '' }));
    else if (error) dispatch(setLoading(false));
  }, [data, error, dispatch]);
  if (isLoading) return <PageLoader />;
  return <>{children}</>;
};

const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode; allowedRoles?: string[] }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const role = useSelector(selectUserRole);
  const isLoading = useSelector((s: RootState) => s.auth.isLoading);
  if (isLoading) return <PageLoader />;
  if (!isAuthenticated) return <Navigate to="/auth/login" replace />;
  if (allowedRoles && role && !allowedRoles.includes(role)) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

const DashboardRedirect = () => {
  const role = useSelector(selectUserRole);
  if (role === 'superAdmin') return <Navigate to="/dashboard/superadmin" replace />;
  if (role === 'schoolAdmin') return <Navigate to="/dashboard/admin" replace />;
  if (role === 'teacher') return <Navigate to="/dashboard/teacher" replace />;
  return <Navigate to="/dashboard/student" replace />;
};

function AppRoutes() {
  return (
    <AuthInitializer>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/register" element={<RegisterPage />} />
          <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/auth/reset-password" element={<ResetPasswordPage />} />

          <Route path="/dashboard" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route index element={<DashboardRedirect />} />
            <Route path="superadmin" element={<ProtectedRoute allowedRoles={['superAdmin']}><SuperAdminDashboard /></ProtectedRoute>} />
            <Route path="admin" element={<ProtectedRoute allowedRoles={['superAdmin','schoolAdmin']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="teacher" element={<ProtectedRoute allowedRoles={['teacher']}><TeacherDashboard /></ProtectedRoute>} />
            <Route path="student" element={<StudentDashboard />} />
            <Route path="students" element={<StudentsPage />} />
            <Route path="students/add" element={<ProtectedRoute allowedRoles={['schoolAdmin','superAdmin']}><AddStudent /></ProtectedRoute>} />
            <Route path="students/:id" element={<StudentDetail />} />
            <Route path="teachers" element={<ProtectedRoute allowedRoles={['schoolAdmin','superAdmin']}><TeachersPage /></ProtectedRoute>} />
            <Route path="classes" element={<ClassesPage />} />
            <Route path="attendance" element={<AttendancePage />} />
            <Route path="attendance/reports" element={<AttendanceReport />} />
            <Route path="exams" element={<ExamsPage />} />
            <Route path="exams/:examId/marks" element={<ProtectedRoute allowedRoles={['teacher','schoolAdmin']}><MarksEntry /></ProtectedRoute>} />
            <Route path="report-card/:studentId/:examId" element={<ReportCard />} />
            <Route path="assignments" element={<AssignmentsPage />} />
            <Route path="fees" element={<ProtectedRoute allowedRoles={['schoolAdmin','superAdmin']}><FeesPage /></ProtectedRoute>} />
            <Route path="invoices" element={<InvoicesPage />} />
            <Route path="notices" element={<NoticesPage />} />
            <Route path="messages" element={<MessagesPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </AuthInitializer>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AppRoutes />
        <Toaster position="top-right" gutter={8} toastOptions={{
          duration: 4000,
          style: { background: '#111827', color: '#F1F1EE', border: '0.5px solid rgba(255,255,255,0.08)', borderRadius: '12px', fontSize: '14px' },
          success: { iconTheme: { primary: '#10B981', secondary: '#111827' } },
          error: { iconTheme: { primary: '#EF4444', secondary: '#111827' } },
        }} />
      </BrowserRouter>
    </Provider>
  );
}
