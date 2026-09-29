import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import LearningProfile from './pages/LearningProfile';
import AdaptiveLearning from './pages/AdaptiveLearning';
import DeepLearningModes from './pages/DeepLearningModes';
import Quizzes from './pages/Quizzes';
import Analytics from './pages/Analytics';
import StudyPlanner from './pages/StudyPlanner';
import RevisionPlanner from './pages/RevisionPlanner';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import AppShell from './components/layout/AppShell';
import ProtectedRoute from './routes/ProtectedRoute';

export default function App() {
  return (
    <>
      <Toaster position="top-right" toastOptions={{ style: { fontSize: '14px', borderRadius: '12px' } }} />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/learning-profile" element={<LearningProfile />} />
          <Route path="/adaptive-learning" element={<AdaptiveLearning />} />
          <Route path="/learn" element={<DeepLearningModes />} />
          <Route path="/quizzes" element={<Quizzes />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/study-planner" element={<StudyPlanner />} />
          <Route path="/revision-planner" element={<RevisionPlanner />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  );
}
