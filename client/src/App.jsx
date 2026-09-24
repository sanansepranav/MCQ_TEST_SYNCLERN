import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layout
import DashboardLayout from './components/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';

// Public Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import Register from './pages/Register';
import NotFound from './pages/NotFound';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageTests from './pages/admin/ManageTests';
import CreateTest from './pages/admin/CreateTest';
import EditTest from './pages/admin/EditTest';
import UploadQuestions from './pages/admin/UploadQuestions';
import UploadAnswerKey from './pages/admin/UploadAnswerKey';
import ManageStudents from './pages/admin/ManageStudents';
import ViewResults from './pages/admin/ViewResults';
import ManageCodingProblems from './pages/admin/ManageCodingProblems';
import ViewCodingSubmissions from './pages/admin/ViewCodingSubmissions';
import AdminCombinedResult from './pages/admin/AdminCombinedResult';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import TakeTest from './pages/student/TakeTest';
import MyResults from './pages/student/MyResults';
import ResultDetail from './pages/student/ResultDetail';
import TakeCodingTest from './pages/student/TakeCodingTest';
import CodingResults from './pages/student/CodingResults';
import CombinedResult from './pages/student/CombinedResult';

const App = () => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', background: 'var(--bg-primary)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 44, height: 44, borderRadius: '50%',
            border: '3px solid rgba(79,142,247,0.2)', borderTopColor: '#4f8ef7',
            animation: 'spin 0.8s linear infinite', margin: '0 auto 16px',
          }} />
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)' }}>Loading SyncTest...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  const getDefaultRoute = () => {
    if (!isAuthenticated) return '/login';
    return user?.role === 'admin' ? '/admin/dashboard' : '/student/dashboard';
  };

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={isAuthenticated ? <Navigate to={getDefaultRoute()} replace /> : <LandingPage />} />
      <Route path="/login" element={isAuthenticated ? <Navigate to={getDefaultRoute()} replace /> : <Login />} />
      <Route path="/admin/login" element={isAuthenticated ? <Navigate to={getDefaultRoute()} replace /> : <AdminLogin />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to={getDefaultRoute()} replace /> : <Register />} />

      {/* Protected: Admin */}
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/tests" element={<ManageTests />} />
          <Route path="/admin/tests/create" element={<CreateTest />} />
          <Route path="/admin/tests/:id/edit" element={<EditTest />} />
          <Route path="/admin/tests/:id/questions" element={<UploadQuestions />} />
          <Route path="/admin/tests/:id/answerkey" element={<UploadAnswerKey />} />
          <Route path="/admin/students" element={<ManageStudents />} />
          <Route path="/admin/results" element={<ViewResults />} />
          <Route path="/admin/tests/:id/coding" element={<ManageCodingProblems />} />
          <Route path="/admin/tests/:id/coding-results" element={<ViewCodingSubmissions />} />
        </Route>
        <Route path="/admin/combined-result/:testId/:studentId" element={<AdminCombinedResult />} />
      </Route>

      {/* Protected: Student */}
      <Route element={<ProtectedRoute allowedRoles={['student']} />}>
        <Route element={<DashboardLayout />}>
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/results" element={<MyResults />} />
          <Route path="/student/results/:id" element={<ResultDetail />} />
        </Route>
        <Route path="/student/test/:id" element={<TakeTest />} />
        <Route path="/student/coding-test/:id" element={<TakeCodingTest />} />
        <Route path="/student/coding-results/:testId" element={<CodingResults />} />
        <Route path="/student/combined-result/:testId" element={<CombinedResult />} />
      </Route>

      {/* Legacy redirect */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<Navigate to={user?.role === 'admin' ? '/admin/dashboard' : '/student/dashboard'} replace />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;
