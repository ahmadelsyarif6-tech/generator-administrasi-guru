
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import AdminGenerator from './pages/generators/AdminGenerator';
import QuestionBankGenerator from './pages/generators/QuestionBankGenerator';
import PesantrenBankGenerator from './pages/generators/PesantrenBankGenerator';
import ECourseGenerator from './pages/generators/ECourseGenerator';
import Results from './pages/Results';
import ImageLab from './pages/ai-lab/ImageLab';
import VideoLab from './pages/ai-lab/VideoLab';
import AudioLab from './pages/ai-lab/AudioLab';
import AdminPanel from './pages/AdminPanel';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Layout>{children}</Layout> : <Navigate to="/landing" />;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/landing" element={<Landing />} />
    
    <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
    <Route path="/generator/administrasi" element={<ProtectedRoute><AdminGenerator /></ProtectedRoute>} />
    <Route path="/generator/bank-soal" element={<ProtectedRoute><QuestionBankGenerator /></ProtectedRoute>} />
    <Route path="/generator/bank-soal-pesantren" element={<ProtectedRoute><PesantrenBankGenerator /></ProtectedRoute>} />
    <Route path="/generator/ecourse" element={<ProtectedRoute><ECourseGenerator /></ProtectedRoute>} />
    <Route path="/results" element={<ProtectedRoute><Results /></ProtectedRoute>} />
    
    <Route path="/lab/image" element={<ProtectedRoute><ImageLab /></ProtectedRoute>} />
    <Route path="/lab/video" element={<ProtectedRoute><VideoLab /></ProtectedRoute>} />
    <Route path="/lab/audio" element={<ProtectedRoute><AudioLab /></ProtectedRoute>} />
    
    <Route path="/admin" element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} />
  </Routes>
);

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
};

export default App;
