import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useAuth } from './hooks/useAuth';

import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { StudentLoginPage } from './pages/StudentLoginPage';
import { TeacherLoginPage } from './pages/TeacherLoginPage';
import { HodLoginPage } from './pages/HodLoginPage';
import { StudentRegisterPage } from './pages/StudentRegisterPage';
import { TeacherRegisterPage } from './pages/TeacherRegisterPage';
import { HodRegisterPage } from './pages/HodRegisterPage';
import { StudentDashboard } from './pages/StudentDashboard';
import { TeacherDashboard } from './pages/TeacherDashboard';
import { HODDashboard } from './pages/HODDashboard';
import { DocumentsPage } from './pages/DocumentsPage';
import { ResumePage } from './pages/ResumePage';
import NotificationsPage from './pages/NotificationsPage';
import { ProfilePage } from './pages/ProfilePage';
import { TeacherStudentsPage } from './pages/TeacherStudentsPage';
import { TeacherApprovalsPage } from './pages/TeacherApprovalsPage';
import { TeacherMessagingPage } from './pages/TeacherMessagingPage';
import { AttendancePage } from './pages/AttendancePage';
import { StudentAttendancePage } from './pages/StudentAttendancePage';
import TeachersPage from './pages/TeachersPage';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/student/login" element={<StudentLoginPage />} />
          <Route path="/teacher/login" element={<TeacherLoginPage />} />
          <Route path="/hod/login" element={<HodLoginPage />} />
          <Route path="/student/register" element={<StudentRegisterPage />} />
          <Route path="/teacher/register" element={<TeacherRegisterPage />} />
          <Route path="/hod/register" element={<HodRegisterPage />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/documents"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <DocumentsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/resume"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <ResumePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/students"
            element={
              <ProtectedRoute allowedRoles={['teacher', 'hod']}>
                <TeacherStudentsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/approvals"
            element={
              <ProtectedRoute allowedRoles={['teacher', 'hod']}>
                <TeacherApprovalsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/messaging"
            element={
              <ProtectedRoute allowedRoles={['teacher', 'hod']}>
                <TeacherMessagingPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/attendance"
            element={
              <ProtectedRoute allowedRoles={['teacher']}>
                <AttendancePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/my-attendance"
            element={
              <ProtectedRoute allowedRoles={['student']}>
                <StudentAttendancePage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/teachers"
            element={
              <ProtectedRoute allowedRoles={['hod']}>
                <TeachersPage />
              </ProtectedRoute>
            }
          />


          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />

          <Route path="/" element={<Navigate to="/student/login" />} />
          <Route path="*" element={<Navigate to="/student/login" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

// Dashboard router
const Dashboard = () => {
  const { user } = useAuth();

  if (user?.role === 'student') {
    return <StudentDashboard />;
  } else if (user?.role === 'teacher') {
    return <TeacherDashboard />;
  } else if (user?.role === 'hod') {
    return <HODDashboard />;
  }

  return <div>Loading...</div>;
};
