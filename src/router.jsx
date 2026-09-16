import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import RootLayout from './RootLayout.jsx';
import { useAuth } from './context/AuthContext.jsx';
import AdminLayout from './components/common/AdminLayout.jsx';

// Public Pages
import HomePage from './pages/public/HomePage.jsx';
import AllExamsPage from './pages/public/AllExamsPage.jsx';
import StudentInfoPage from './pages/public/StudentInfoPage.jsx';
import ExamPage from './pages/public/ExamPage.jsx';
import ResultPage from './pages/public/ResultPage.jsx';
import SolutionPage from './pages/public/SolutionPage.jsx';
import LeaderboardPage from './pages/public/LeaderboardPage.jsx';
import StudentHistoryPage from './pages/public/StudentHistoryPage.jsx';
import StudentLoginPage from './pages/public/StudentLoginPage.jsx';
import StudentRegisterPage from './pages/public/StudentRegisterPage.jsx';
import StudentProfilePage from './pages/public/StudentProfilePage.jsx';

// Admin Pages
import AdminLoginPage from './pages/admin/AdminLoginPage.jsx';
import AdminDashboardPage from './pages/admin/AdminDashboardPage.jsx';
import ExamManagementPage from './pages/admin/ExamManagementPage.jsx';
import QuestionBankPage from './pages/admin/QuestionBankPage.jsx';
import StudentManagementPage from './pages/admin/StudentManagementPage.jsx';
import SubmissionManagementPage from './pages/admin/SubmissionManagementPage.jsx';
import AnalyticsPage from './pages/admin/AnalyticsPage.jsx';
import AdminManagementPage from './pages/admin/AdminManagementPage.jsx';
import SettingsPage from './pages/admin/SettingsPage.jsx';

// Protected Route Guard for Admin
export const ProtectedAdminRoute = ({ children, requireSuperAdmin = false }) => {
  const { admin, loading, isSuperAdmin } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white text-sm">
        লোড হচ্ছে...
      </div>
    );
  }

  if (!admin) {
    return <Navigate to="/login" replace />;
  }

  if (requireSuperAdmin && !isSuperAdmin) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return <AdminLayout>{children}</AdminLayout>;
};

// Protected Route Guard for Student Profile
export const ProtectedStudentRoute = ({ children }) => {
  const { student, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-slate-600 text-sm">
        লোড হচ্ছে...
      </div>
    );
  }

  if (!student) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      // Public / Student Routes
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'login',
        element: <StudentLoginPage />,
      },
      {
        path: 'register',
        element: <StudentRegisterPage />,
      },
      {
        path: 'profile',
        element: (
          <ProtectedStudentRoute>
            <StudentProfilePage />
          </ProtectedStudentRoute>
        ),
      },
      {
        path: 'all-exams',
        element: <AllExamsPage />,
      },
      {
        path: 'history',
        element: <StudentHistoryPage />,
      },
      {
        path: 'exam/:slug',
        element: <StudentInfoPage />,
      },
      {
        path: 'exam/:slug/leaderboard',
        element: <LeaderboardPage />,
      },
      {
        path: 'exam/:slug/take',
        element: <ExamPage />,
      },
      {
        path: 'result/:id',
        element: <ResultPage />,
      },
      {
        path: 'solution/:id',
        element: <SolutionPage />,
      },

      // Admin Login & Redirects
      {
        path: 'admin/login',
        element: <AdminLoginPage />,
      },
      {
        path: 'admin',
        element: <Navigate to="/admin/dashboard" replace />,
      },

      // Admin Protected Routes
      {
        path: 'admin/dashboard',
        element: (
          <ProtectedAdminRoute>
            <AdminDashboardPage />
          </ProtectedAdminRoute>
        ),
      },
      {
        path: 'admin/exams',
        element: (
          <ProtectedAdminRoute>
            <ExamManagementPage />
          </ProtectedAdminRoute>
        ),
      },
      {
        path: 'admin/questions',
        element: (
          <ProtectedAdminRoute>
            <QuestionBankPage />
          </ProtectedAdminRoute>
        ),
      },
      {
        path: 'admin/students',
        element: (
          <ProtectedAdminRoute>
            <StudentManagementPage />
          </ProtectedAdminRoute>
        ),
      },
      {
        path: 'admin/submissions',
        element: (
          <ProtectedAdminRoute>
            <SubmissionManagementPage />
          </ProtectedAdminRoute>
        ),
      },
      {
        path: 'admin/analytics',
        element: (
          <ProtectedAdminRoute>
            <AnalyticsPage />
          </ProtectedAdminRoute>
        ),
      },
      {
        path: 'admin/admins',
        element: (
          <ProtectedAdminRoute requireSuperAdmin>
            <AdminManagementPage />
          </ProtectedAdminRoute>
        ),
      },
      {
        path: 'admin/settings',
        element: (
          <ProtectedAdminRoute requireSuperAdmin>
            <SettingsPage />
          </ProtectedAdminRoute>
        ),
      },

      // Catch-all Fallback
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);

export default router;
